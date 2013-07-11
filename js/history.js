/**
 * User: ArtZub
 * Date: 10.07.13
 * Time: 16:38
 */

function inflate(d) {
    while ((d = d.parent) && !d.root) d.size++;
}

(function(vis) {

    var chapi = chrome.history;

    var asyncForEach = function(items, fn, time) {
        if (!(items instanceof Array))
            return;

        var workArr = items.reverse().concat();

        function loop() {
            if (workArr.length > 0)
                fn(workArr.shift(), workArr);
            if (workArr.length > 0)
                setTimeout(loop, time || 1);
        }
        loop();
    };

    /**
     * code from http://with-love-from-siberia.blogspot.ru/2009/07/url-parsing-in-javascript.html
     */
    if ( ! String.prototype.parseUrl ) {

        /**
         * Considers the string object as URL and returns it's parts separately
         *
         * @param void
         * @return Object
         * @access public
         */
        String.prototype.parseUrl = function()
        {
            var matches = this.match(arguments.callee.re);

            if ( ! matches ) {
                return null;
            }

            return {
                'full' : this,
                'scheme': matches[1] || '',
                'subscheme': matches[2] || '',
                'user': matches[3] || '',
                'pass': matches[4] || '',
                'host': matches[5],
                'zone': matches[5].replace(/(?:.*\.)+([a-z]{2,})|.*/i, "$1") || '',
                'port': matches[6] || '',
                'path': matches[7] || '',
                'query': matches[8] || '',
                'fragment': matches[9] || ''
            };
        };

        String.prototype.parseUrl.re = /^(?:([a-zа-я-]+):(?:([a-zа-я]*):)?\/\/)?(?:([^:@]*)(?::([^:@]*))?@)?((?:[a-zа-я0-9_-]+\.?)+|localhost|(?:(?:[01]?\d\d?|2[0-4]\d|25[0-5])\.){3}(?:(?:[01]?\d\d?|2[0-4]\d|25[0-5])))(?::(\d+))?(?:([^:\?\#]+))?(?:\?([^\#]+))?(?:\#([^\s]+))?$/i;
    }

    var div = d3.select("#main");

    var urls = [],
        hashUrl = d3.map({});

    vis.nodes = [{x: w / 2, y: h / 2, size: 1, root: true}];
    vis.links = [];
    vis.nodesByPath = {};

    function parserSearchResults(results) {
        var ul = div.append("ul");
        results.forEach(function(item) {
            var url = hashUrl.get(item.url) || -1;
            if (url < 0) {
                url = urls.push(item.url.parseUrl()) - 1;
                hashUrl.set(item.url, url);
            }
            url = urls[url];
            //chapi.getVisits({url: item.url}, parserUrlVisits(item, ul.append("li").text(JSON.stringify(item))));
        });

        makeNodes(urls);
    }

    function makeNodes(urls) {
        var urlByDomain = d3.nest()
            .key(function(d) { return d.host; })
            .entries(urls);

        asyncForEach(urlByDomain, function(kv, arr) {
            asyncForEach(kv.values, function(value) {
                var dom = vis.nodesByPath[kv.key] || -1;
                if (dom < 0) {
                    vis.nodesByPath[kv.key] = dom = addNode(0);
                }

                var sp = value.path,
                    wp = value.host;

                if (!sp || sp.length < 1)
                    return;

                var spa = sp.trim().split("/"),
                    i = 0,
                    root = dom,
                    ind;

                while(i++ < spa.length - 1){
                    spa[i] = spa[i] ? spa[i].trim() : spa[i];
                    if (!spa[i])
                        continue;

                    wp += "/" + spa[i];

                    ind = vis.nodesByPath[wp] || -1;
                    if (ind < 0)
                        vis.nodesByPath[wp] = root = addNode(root);
                    else
                        vis.nodes[root].size++;
                }
            }, 500);
        }, 300);
    }

    function addNode(source) {
        source = vis.nodes[source];
        var bud = {x: source.x + Math.random() - .5, y: source.y + Math.random() - .5, parent: source, size: 1};
        inflate(bud);
        var ind = vis.nodes.push(bud) - 1;
        vis.links.push({source: source, target: bud});
        force.nodes(vis.nodes);
        force.links(vis.links);
        updateNodes();
        return ind;
    }



    function parserUrlVisits(hitem, li) {
        return function(visits) {
            /*var ul = li.append("ul");
            visits.forEach(function(item) {
                ul.append("li").text(JSON.stringify(item));
            })*/
        }
    }

    function parserVisits(visits) {

    }

    chapi.search({"text": "", "maxResults" : 100000000, "startTime":(new Date()).getTime() - (3600000 * 48), "endTime": (new Date()).getTime()}, parserSearchResults);

})(vis || (vis = {}));