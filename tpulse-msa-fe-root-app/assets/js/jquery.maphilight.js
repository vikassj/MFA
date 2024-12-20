(function (root, factory) { if (typeof define === 'function' && define.amd) { define(['jquery'], factory); } else { factory(root.jQuery); } })(this, function ($) {
    var has_VML, has_canvas, create_canvas_for, add_shape_to, clear_canvas, shape_from_area, canvas_style, hex_to_decimal, css3color, is_image_loaded, options_from_area; has_canvas = !!document.createElement('canvas').getContext; has_VML = (function () { var a = document.createElement('div'); a.innerHTML = '<v:shape id="vml_flag1" adj="1" />'; var b = a.firstChild; b.style.behavior = "url(#default#VML)"; return b ? typeof b.adj == "object" : true; })(); if (!(has_canvas || has_VML)) { $.fn.maphilight = function () { return this; }; return; }
    if (has_canvas) {
        hex_to_decimal = function (hex) { return Math.max(0, Math.min(parseInt(hex, 16), 255)); }; css3color = function (color, opacity) { return 'rgba(' + hex_to_decimal(color.substr(0, 2)) + ',' + hex_to_decimal(color.substr(2, 2)) + ',' + hex_to_decimal(color.substr(4, 2)) + ',' + opacity + ')'; }; create_canvas_for = function (img) { var c = $('<canvas style="width:' + $(img).width() + 'px;height:' + $(img).height() + 'px;"></canvas>').get(0); c.getContext("2d").clearRect(0, 0, $(img).width(), $(img).height()); return c; }; var draw_shape = function (context, shape, coords, x_shift, y_shift) {
            x_shift = x_shift || 0; y_shift = y_shift || 0; context.beginPath(); if (shape == 'rect') { context.rect(coords[0] + x_shift, coords[1] + y_shift, coords[2] - coords[0], coords[3] - coords[1]); } else if (shape == 'poly') { context.moveTo(coords[0] + x_shift, coords[1] + y_shift); for (i = 2; i < coords.length; i += 2) { context.lineTo(coords[i] + x_shift, coords[i + 1] + y_shift); } } else if (shape == 'circ') { context.arc(coords[0] + x_shift, coords[1] + y_shift, coords[2], 0, Math.PI * 2, false); }
            context.closePath();
        }; var add_open_close_count = function (context, shape, coords, open_count, close_count, x, y, x_shift, y_shift) {
            x_shift = x_shift || 0; y_shift = y_shift || 0; if (typeof (open_count) === 'number' || open_count === '-') { if (open_count < 10 || open_count === '-') { context.font = "700 18pt sans-serif"; context.fillStyle = "#dc3545"; context.fillText(open_count, x_shift + x - 30, y_shift + y + 5); context.fillStyle = "#ffffff"; context.fillText(' | ', x_shift + x - 20, y_shift + y + 5); context.fillStyle = "#28a745"; context.fillText(close_count, x_shift + x - 4, y_shift + y + 5) } else { context.font = "700 18pt sans-serif"; context.fillStyle = "#dc3545"; context.fillText(open_count, x_shift + x - 40, y_shift + y + 5); context.fillStyle = "#ffffff"; context.fillText(' | ', x_shift + x - 6, y_shift + y + 5); context.fillStyle = "#28a745"; context.fillText(close_count, x_shift + x + 10, y_shift + y + 5) } };
        }; add_shape_to = function (canvas, shape, coords, options, name, title) {
            var open_count = options.openCloseCount.find(item => item.mapTitle === title).openCount;
            var close_count = options.openCloseCount.find(item => item.mapTitle === title).closeCount;
            var centroid = options.openCloseCount.find(item => item.mapTitle === title).centroid;
            var i, context = canvas.getContext('2d'); if (options.shadow) {
                context.save(); if (options.shadowPosition == "inside") { draw_shape(context, shape, coords); add_open_close_count(context, shape, coords, open_count, close_count, centroid[0], centroid[1]); context.clip(); }
                var x_shift = canvas.width * 100; var y_shift = canvas.height * 100; draw_shape(context, shape, coords, x_shift, y_shift); add_open_close_count(context, shape, coords, open_count, close_count, centroid[0], centroid[1], x_shift, y_shift); context.shadowOffsetX = options.shadowX - x_shift; context.shadowOffsetY = options.shadowY - y_shift; context.shadowBlur = options.shadowRadius; context.shadowColor = css3color(options.shadowColor, options.shadowOpacity); var shadowFrom = options.shadowFrom; if (!shadowFrom) { if (options.shadowPosition == 'outside') { shadowFrom = 'fill'; } else { shadowFrom = 'stroke'; } }
                if (shadowFrom == 'stroke') { context.strokeStyle = "rgba(0,0,0,1)"; context.stroke(); } else if (shadowFrom == 'fill') { context.fillStyle = "rgba(0,0,0,1)"; context.fill(); }
                context.restore(); if (options.shadowPosition == "outside") { context.save(); draw_shape(context, shape, coords); add_open_close_count(context, shape, coords, open_count, close_count, centroid[0], centroid[1]); context.globalCompositeOperation = "destination-out"; context.fillStyle = "rgba(0,0,0,1);"; context.fill(); context.restore(); }
            }
            context.save(); draw_shape(context, shape, coords); add_open_close_count(context, shape, coords, open_count, close_count, centroid[0], centroid[1]); if (options.fill) { context.fillStyle = css3color(options.fillColor, options.fillOpacity); context.fill(); }
            if (options.stroke) { context.strokeStyle = css3color(options.strokeColor, options.strokeOpacity); context.lineWidth = options.strokeWidth; context.stroke(); }
            context.restore(); if (options.fade) { $(canvas).css('opacity', 0).animate({ opacity: 1 }, 100); }
        }; clear_canvas = function (canvas) { canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); };
    } else {
        create_canvas_for = function (img) { return $('<var style="zoom:1;overflow:hidden;display:block;width:' + img.width + 'px;height:' + img.height + 'px;"></var>').get(0); }; add_shape_to = function (canvas, shape, coords, options, name) {
            var fill, stroke, opacity, e; for (var i in coords) { coords[i] = parseInt(coords[i], 10); }
            fill = '<v:fill color="#' + options.fillColor + '" opacity="' + (options.fill ? options.fillOpacity : 0) + '" />'; stroke = (options.stroke ? 'strokeweight="' + options.strokeWidth + '" stroked="t" strokecolor="#' + options.strokeColor + '"' : 'stroked="f"'); opacity = '<v:stroke opacity="' + options.strokeOpacity + '"/>'; if (shape == 'rect') { e = $('<v:rect name="' + name + '" filled="t" ' + stroke + ' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:' + coords[0] + 'px;top:' + coords[1] + 'px;width:' + (coords[2] - coords[0]) + 'px;height:' + (coords[3] - coords[1]) + 'px;"></v:rect>'); } else if (shape == 'poly') { e = $('<v:shape name="' + name + '" filled="t" ' + stroke + ' coordorigin="0,0" coordsize="' + canvas.width + ',' + canvas.height + '" path="m ' + coords[0] + ',' + coords[1] + ' l ' + coords.join(',') + ' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:' + canvas.width + 'px;height:' + canvas.height + 'px;"></v:shape>'); } else if (shape == 'circ') { e = $('<v:oval name="' + name + '" filled="t" ' + stroke + ' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:' + (coords[0] - coords[2]) + 'px;top:' + (coords[1] - coords[2]) + 'px;width:' + (coords[2] * 2) + 'px;height:' + (coords[2] * 2) + 'px;"></v:oval>'); }
            e.get(0).innerHTML = fill + opacity; $(canvas).append(e);
        }; clear_canvas = function (canvas) { var $html = $("<div>" + canvas.innerHTML + "</div>"); $html.children('[name=highlighted]').remove(); canvas.innerHTML = $html.html(); };
    }
    shape_from_area = function (area) {
        var i, coords = area.getAttribute('coords').split(','); for (i = 0; i < coords.length; i++) { coords[i] = parseFloat(coords[i]); }
        return [area.getAttribute('shape').toLowerCase().substr(0, 4), coords];
    }; options_from_area = function (area, options) { var $area = $(area); return $.extend({}, options, $.metadata ? $area.metadata() : false, $area.data('maphilight')); }; is_image_loaded = function (img) {
        if (!img.complete) { return false; }
        if (typeof img.naturalWidth != "undefined" && img.naturalWidth === 0) { return false; }
        return true;
    }; canvas_style = { position: 'absolute', left: 0, top: 0, padding: 0, border: 0 }; var ie_hax_done = false; $.fn.maphilight = function (opts) {
        opts = $.extend({}, $.fn.maphilight.defaults, opts); if (!has_canvas && !ie_hax_done) { $(window).ready(function () { document.namespaces.add("v", "urn:schemas-microsoft-com:vml"); var style = document.createStyleSheet(); var shapes = ['shape', 'rect', 'oval', 'circ', 'fill', 'stroke', 'imagedata', 'group', 'textbox']; $.each(shapes, function () { style.addRule('v\\:' + this, "behavior: url(#default#VML); antialias:true"); }); }); ie_hax_done = true; }
        return this.each(function () {
            var img, wrap, options, map, canvas, canvas_always, highlighted_shape, usemap; img = $(this); if (!is_image_loaded(this)) { return window.setTimeout(function () { img.maphilight(opts); }, 200); }
            options = $.extend({}, opts, $.metadata ? img.metadata() : false, img.data('maphilight')); usemap = img.get(0).getAttribute('usemap'); if (!usemap) { return; }
            map = $('map[name="' + usemap.substr(1) + '"]'); if (!(img.is('img,input[type="image"]') && usemap && map.length > 0)) { return; }
            if (img.hasClass('maphilighted')) { var wrapper = img.parent(); img.insertBefore(wrapper); wrapper.remove(); $(map).unbind('.maphilight'); }
            wrap = $('<div></div>').css({ display: 'block', backgroundImage: 'url("' + this.src + '")', backgroundSize: 'contain', position: 'relative', padding: 0, width: this.width, height: this.height }); if (options.wrapClass) { if (options.wrapClass === true) { wrap.addClass($(this).attr('class')); } else { wrap.addClass(options.wrapClass); } }
            img.before(wrap).css('opacity', 0).css(canvas_style).remove(); if (has_VML) { img.css('filter', 'Alpha(opacity=0)'); }
            wrap.append(img); canvas = create_canvas_for(this); $(canvas).css(canvas_style); canvas.height = this.height; canvas.width = this.width; $(map).bind('alwaysOn.maphilight', function () {
                if (canvas_always) { clear_canvas(canvas_always); }
                if (!has_canvas) { $(canvas).empty(); }
                $(map).find('area[coords]').each(function () {
                    var shape, area_options; area_options = options_from_area(this, options); if (area_options.alwaysOn) {
                        if (!canvas_always && has_canvas) { canvas_always = create_canvas_for(img[0]); $(canvas_always).css(canvas_style); canvas_always.width = img[0].width; canvas_always.height = img[0].height; img.before(canvas_always); }
                        area_options.fade = area_options.alwaysOnFade; shape = shape_from_area(this); if (has_canvas) { add_shape_to(canvas_always, shape[0], shape[1], area_options, "", this.title); } else { add_shape_to(canvas, shape[0], shape[1], area_options, "", this.title); }
                    }
                });
            }).trigger('alwaysOn.maphilight').bind('mouseover.maphilight, focus.maphilight', function (e) {
                var shape, area_options, area = e.target; area_options = options_from_area(area, options); if (!area_options.neverOn && !area_options.alwaysOn) {
                    shape = shape_from_area(area); add_shape_to(canvas, shape[0], shape[1], area_options, "highlighted", this.title); if (area_options.groupBy) {
                        var areas; if (/^[a-zA-Z][\-a-zA-Z]+$/.test(area_options.groupBy)) { areas = map.find('area[' + area_options.groupBy + '="' + $(area).attr(area_options.groupBy) + '"]'); } else { areas = map.find(area_options.groupBy); }
                        var first = area; areas.each(function () { if (this != first) { var subarea_options = options_from_area(this, options); if (!subarea_options.neverOn && !subarea_options.alwaysOn) { var shape = shape_from_area(this); add_shape_to(canvas, shape[0], shape[1], subarea_options, "highlighted", this.title); } } });
                    }
                    if (!has_canvas) { $(canvas).append('<v:rect></v:rect>'); }
                }
            }).bind('mouseout.maphilight, blur.maphilight', function (e) { clear_canvas(canvas); }); img.before(canvas); img.addClass('maphilighted');
        });
    }; $.fn.maphilight.defaults = { fill: true, fillColor: '000000', fillOpacity: 0.2, stroke: true, strokeColor: 'ff0000', strokeOpacity: 1, strokeWidth: 1, fade: true, alwaysOn: false, neverOn: false, groupBy: false, wrapClass: true, shadow: false, shadowX: 0, shadowY: 0, shadowRadius: 6, shadowColor: '000000', shadowOpacity: 0.8, shadowPosition: 'outside', shadowFrom: false };
});