(function() {
    var ctx = document.getElementById("canvas").getContext("2d");
    ctx.lineWidth = 5;
    var drawing = false;
    var mousePos = { x: 0, y: 0 };
    var lastPos = mousePos;

    $("#canvas").on("mousedown", function(e) {
        drawing = true;
        lastPos = getMousePos(e);
        renderCanvas();
    });

    $("#canvas").on("mouseup", function(e) {
        drawing = false;
    });

    $("#canvas").on("mousemove", function(e) {
        mousePos = getMousePos(e);
        renderCanvas();
    });
    //https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
    //or use offsetX and offsetY
    function getMousePos(mouseEvent) {
        return {
            x: mouseEvent.pageX - $("canvas").offset().left,
            y: mouseEvent.pageY - $("canvas").offset().top
        };
    }

    function renderCanvas() {
        if (drawing) {
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.stroke();
            lastPos = mousePos;
        }
    }

    $("#button1").on("click", function(e) {
        $("input[name=firstName]").attr(
            "value",
            $("input[name=firstName]").val()
        );
        $("input[name=lastName]").attr(
            "value",
            $("input[name=lastName]").val()
        );
        $("input[name=signature]").attr(
            "value",
            document.getElementById("canvas").toDataURL()
        ); //no jquery for toDataURL
    });
})();
