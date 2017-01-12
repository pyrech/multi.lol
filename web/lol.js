var LOL = {
    /* HTML elts */
    "central": null,
    "canvas": null,
    "fallback": null,
    "counter": null,
    "fps": null,
    "player": null,

    /* Mode : true => canvas, false => fallback via dom */
    "mode_canvas": false,

    /* Context for canvas */
    "ctx": null,

    /* Vars used for stats */
    "count": 0,
    "last_loop_date": null,
    "mean_fps_on": 50,
    "filter_strength": 20, // the higher this value, the less fps will reflect temporary variations
    "frame_time": 0,
    "last_loop": new Date,

    /* Store the window size */
    "max_x": window.innerWidth,
    "max_y": window.innerHeight,

    /* Properties of strings to display */
    "fonts": new Array ('Arial', 'Helvetica', 'sans-serif', "'Times New Roman'", 'Times', "'Liberation Serif'", 'FreeSerif', 'serif'),
    "sizes": new Array (11, 13, 15, 17, 19, 21, 23, 25, 27, 29),
    "weights": new Array (400, 700, 900),
    "colors": new Array ('0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'),

    /**
     * Init everything
     */
    "init": function() {
        /* Get HTML elts */
        LOL.central = document.getElementById("central");
        LOL.counter = document.getElementById("counter");
        LOL.fps = document.getElementById("fps");
        LOL.canvas = document.getElementById('canvas');
        LOL.player = document.getElementById("player");

        /* Launch GrooveShark */
        LOL.launchPlayer();
        setInterval(LOL.launchPlayer, 130000);

        /* Launch FPS refresh */
        setInterval(function(){
          LOL.fps.innerHTML = (1000/LOL.frame_time).toFixed(1);
        }, 1000);

        /* Handle window resize */
        window.onresize = LOL.onWindowResize;

        /* Handle mouse move */
        window.onmousemove = function(event){
            if(window.event)
                event = window.event; //grrr IE
            var x = event.clientX;
            var y = event.clientY;
            if (LOL.mode_canvas) {
                LOL.drawCanvas(x, y);
            }
            else {
                LOL.drawDom(x, y);
            }
        };

        /* Detect the mode and init the animation (canvas or DOM) */
        if (!LOL.canvas.getContext) {
            LOL.mode_canvas = false;
            LOL.fallback = document.getElementById('fallback');
            setInterval(function() {
                var x = Math.floor(Math.random()*(LOL.max_x));
                var y = Math.floor(Math.random()*(LOL.max_y));
                LOL.drawDom(x, y);
                LOL.calculFps();
            }, 10);
        }
        else {
            LOL.mode_canvas = true;
            LOL.ctx = LOL.canvas.getContext('2d');
            setInterval(function() {
                var x = Math.floor(Math.random()*LOL.max_x-5);
                var y = Math.floor(Math.random()*LOL.max_y+5);
                LOL.drawCanvas(x, y);
                LOL.calculFps();
            }, 10);
        }
        LOL.onWindowResize();
    },

    /**
     * Adapt the size of the animation to fit the window's dimension
     */
    "onWindowResize": function() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        /* Set the size of the canvas */
        if (LOL.mode_canvas) {
            var data = null;
            if (LOL.ctx) {
                data = LOL.ctx.getImageData(0, 0, width, height);
            }
            LOL.canvas.width = width;
            LOL.canvas.height = height;
            if (LOL.ctx) {
                LOL.ctx.putImageData(data, 0, 0);
            }
        }

        /* Set the font-size for the central LOL */
        var fpc = width/10;
        fpc = Math.round(fpc*100)/4;
        LOL.central.style.fontSize = fpc+'%';

        /* Set the max width and height for string's position */
        LOL.max_x = width;
        LOL.max_y = height;
    },

    /**
     * Return a random element of an array
     */
    "rand": function(a) {
        return a[Math.floor(Math.random()*a.length)];
    },

    /**
     * Return the string "LOL" with random number of "O"
     */
    "getString": function() {
        /* Find the number of O (1 is more often used than 4) */
        var rand = Math.random();
        var nb_o = 1;
        if (rand >= 0.95) nb_o = 4;
        else if (rand >= 0.85) nb_o = 3;
        else if (rand >= 0.65) nb_o = 2;

        /* Create the string */
        var str = "L";
        for(var i=0; i<nb_o; i++) {
            str = str + "O";
        }
        str = str+"L";

        return str;
    },

    /**
     * Perform the animation using DOM elements.
     * Much slower than canvas but used as a fallback for older browser.
     */
    "drawDom": function(x, y) {
        /* Get random properties for string to display */
        // Font, size, weight
        var font   = LOL.rand(LOL.fonts);
        var size   = LOL.rand(LOL.sizes);
        var weight = LOL.rand(LOL.weights);
        // Color
        var r = LOL.rand(LOL.colors) + LOL.rand(LOL.colors);
        var g = LOL.rand(LOL.colors) + LOL.rand(LOL.colors);
        var b = LOL.rand(LOL.colors) + LOL.rand(LOL.colors);

        /* Get the LOL string and create the DOM element with the defined style */
        var str = LOL.getString();
        var tag = document.createElement('span');
        tag.innerHTML = str;
        tag.setAttribute('class', 'lol');
        tag.setAttribute('style', 'font-family:' + font + ';'
                               + ' font-size:' + size + 'px;'
                               + ' font-weight:' + weight + ';'
                               + ' color:#' + r + g + b + ';'
                               + ' top:' + y + 'px;'
                               + ' left:' + x + 'px;');

        /* Add the element to the container */
        LOL.fallback.appendChild(tag);

        LOL.updateCount();
    },

    /**
     * Perform the animation using a canvas
     */
    "drawCanvas": function(x, y) {
        /* Get random properties for string to display */
        // Font, size, weight
        var font   = LOL.rand(LOL.fonts);
        var size   = LOL.rand(LOL.sizes);
        var weight = LOL.rand(LOL.weights);
        // Angle
        /*
        var angle = Math.random()*Math.PI/3;
        angle = (angle >= Math.PI/6 ? angle : 2*Math.PI-angle);
        */
        // Color
        var r = Math.floor(Math.random()*256);
        var g = Math.floor(Math.random()*256);
        var b = Math.floor(Math.random()*256);

        /* Get the LOL string */
        var str = LOL.getString();

        //LOL.ctx.save();

        /* Prepare the context with the choosen style */
        LOL.ctx.font = size + "pt " + font;
        LOL.ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";

        /* Rotate the string on its center */
        /*
        var metric = LOL.ctx.measureText(str);
        var tx = x + (metric.width/2);
        var ty = y + 5;
        LOL.ctx.translate(tx,ty);
        LOL.ctx.rotate(angle);
        LOL.ctx.translate(-tx,-ty);
        */

        /* Draw the string to the correct position */
        LOL.ctx.fillText(str, x, y);

        //LOL.ctx.restore();

        LOL.updateCount();
    },

    /**
     * Draw the count value
     */
    "updateCount": function() {
        LOL.count++;
        LOL.counter.innerHTML = LOL.count;
    },

    /**
     * Calcul FPS values
     */
    "calculFps": function() {
        var this_loop = new Date;
        var this_frame_time = this_loop - LOL.last_loop;
        LOL.frame_time += (this_frame_time - LOL.frame_time) / LOL.filter_strength;
        LOL.last_loop = this_loop;
    },

    /**
     * Launch the GrooveShark player
     */
    "launchPlayer": function() {
        LOL.player.innerHTML = '<audio src="trololo.mp3" autoplay loop></audio>';
    },

    /**
     * Allow to share on social networks with the current score
     */
    "onShare": function(elt) {
        window.open(elt.href.replace('XX', LOL.count));
    }
};

LOL.init();
