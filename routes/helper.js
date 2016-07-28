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

hbs.registerHelper('ifeq', function(a, b, options){
    if (a == b) {
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});

hbs.registerHelper('ifin', function(ele, arr, options){
    var flag = false;
    for(i = 0; i < arr.length; i++){
        if (ele === arr[i].name){
            flag = true;
            break;
        }
    }
    return flag ? options.fn(this): options.inverse(this);
});

hbs.registerHelper('ifstartwith', function(str, start, options){
    var rex = new RegExp('^'+start);
    if (rex.test(str)){
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});