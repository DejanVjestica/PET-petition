(function() {
    const canvas = document.querySelector(".canv");
    if (!canvas) {
        return;
    }
    const ctx = canvas.getContext("2d");
    const submit = document.querySelector(".submit");
    let offsetX, offsetY;
    // let x = e.offsetX;
    // let y = e.offsetY;

    function mouseDown(e) {
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        // console.log(e.target);
        e.target.addEventListener("mousemove", mouseMove);
        // mouseMove(e);
        document.addEventListener("mouseup", function() {
            canvas.removeEventListener("mousemove", mouseMove);
            //
        });
    }
    function mouseMove(e) {
        ctx.strokeStyle = "black";
        ctx.lineCap = "square";
        ctx.lineWidth = 5;

        // ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    }
    canvas.addEventListener("mousedown", mouseDown);

    submit.addEventListener("click", function() {
        // let hiddenInput = document.querySelector('input[name="sig"]').value;
        let secret = canvas.toDataURL();
        //
        console.log("secret; ", secret);
        document.querySelector('input[name="sig"]').value = secret;
        // console.log(hiddenInput);
    });
})(); // End of IFFIES

function myFunction(x) {
    x.classList.toggle("change");
}
$(document).ready(function() {
    // jquery

    $(".nav").hide();
    $(".hamburger").click(function() {
        $(".nav").slideToggle();
    });
});
