var hbs = require('hbs');

/**
 * load css
 * *Usage example:*
    in default.hbs:
    {{#each cssList}}
    <link href="{{this}}" rel="stylesheet">
    {{/each}}
    in other views:
    {{css '/styles/blog.css'}}
 */
hbs.registerHelper('css', function(str) {
    var cssList = this.cssList || [];

    if(cssList.indexOf(str) < 0){
        cssList.push(str);
    }

    this.cssList = cssList;
});

/**
 * load js
 * *Usage example:*
    in default.hbs:
    {{#each jsList}}
    <script src="{{this}}"></script>
    {{/each}}
    in other views:
    {{js '/js/blog.js'}}
 */
hbs.registerHelper('js', function(str) {
    var jsList = this.jsList || [];

    if(jsList.indexOf(str) < 0){
        jsList.push(str);
    }

    this.jsList = jsList;
});