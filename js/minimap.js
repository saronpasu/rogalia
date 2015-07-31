"use strict";
function Minimap() {
    var defaultScale = 0.25;
    var SCALE = defaultScale;
    var loader = new Loader(window.location.protocol + "//" + game.network.addr);
    this.mapImage = loader.loadImage("/map");
    var width = 1;
    loader.ready(function() {
        width = this.mapImage.width;
        this.mapImage.width = width * SCALE;
    }.bind(this));
    this.points = {};
    this.characters = {};

    var wrapper = document.createElement("div");
    wrapper.className = "wrapper no-drag";
    wrapper.appendChild(this.mapImage);

    var lvl = 0;
    var zoom = document.createElement("button");
    zoom.textContent = T("Zoom");
    zoom.onclick = function() {
        switch (lvl++) {
        case 0:
            SCALE *= 2; break;
        case 1:
            wrapper.classList.add("zoom");
            SCALE = 1; break;
        case 2:
            SCALE = defaultScale;
            wrapper.classList.remove("zoom");
            lvl = 0;
            break;
        }
        this.mapImage.width = width * SCALE;
    }.bind(this);

    this.mapImage.onclick = function(e) {
        if (!game.player.IsAdmin)
            return;
        var rect = e.target.getBoundingClientRect();
        var x = e.pageX - rect.left;
        var y = e.pageY - rect.top;
        game.network.send(
            "teleport",
            {"x": x / SCALE * CELL_SIZE, "y": y / SCALE * CELL_SIZE}
        );
    };

    this.panel = new Panel(
        "map",
        "Map",
        [wrapper, zoom]
    );

    this.sync = function(data) {
        if (!data)
            return;
        this.characters = data;
        this.update();
    };

    var x, y;
    this.update = function() {
        var characters = this.characters;
        for(var name in this.points) {
            if (!characters[name]) {
                util.dom.remove(this.points[name]);
                delete this.points[name];
            }
        }

        if (!this.panel.visible)
            return;

        for (var name in characters) {
            x = characters[name].X / CELL_SIZE;
            y = characters[name].Y / CELL_SIZE;

            if (!this.points[name]) {
                this.points[name] = document.createElement("div");
                this.points[name].className = "point";
                this.points[name].title = name;

                if (name == game.player.Name)
                    this.points[name].id = "player-point";

                wrapper.appendChild(this.points[name]);
            }
            this.points[name].style.left = SCALE * x + "px";
            this.points[name].style.top = SCALE * y + "px";
        }
    };

    this.panel.hooks.show = this.update.bind(this);
}