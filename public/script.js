(function() {
    const canvas = document.querySelector(".canv");
    if (!canvas) {
        return;
    }
    const ctx = canvas.getContext("2d");
    const submit = document.querySelector(".submit");
    let offsetX, offsetY;

    function mouseDown(e) {
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        e.target.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", function() {
            canvas.removeEventListener("mousemove", mouseMove);
        });
    }
    function mouseMove(e) {
        ctx.strokeStyle = "black";
        ctx.lineCap = "square";
        ctx.lineWidth = 5;
        ctx.moveTo(offsetX, offsetY);
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    }
    canvas.addEventListener("mousedown", mouseDown);

    submit.addEventListener("click", function() {
        let secret = canvas.toDataURL();
        document.querySelector('input[name="sig"]').value = secret;
    });
})(); // End of IFFIES

// jquery -----------------
$(document).ready(function() {
    $(".nav").hide();
    $(".hamburger").click(function() {
        $(".nav").slideToggle();
    });
});
