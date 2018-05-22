(function() {
    const canvas = document.querySelector(".canv");
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

// const ctx = document.getElementById("canv").getContext("2d");
// const ctx = canvas.getContext("2d");

// Canvas handeling

// canvasField.addEventListener("mousemove", mouseMove);

// canvasField.addEventListener("mousemove", function(e) {
//     console.log(e.clientX);
//     // canvasField.addEventListener("mousemove", mouseMove);
//     // console.log(e.clientX);
// });
// canvasField.addEventListener("mouseup", function(e) {
//     e.target.removeEventListener("mousemove", canvas);
//     e.target.removeEventListener("mousedown", canvas);
//     console.log("removesd");
// });
// //
// // canvasField.addEventListener("mousedown", canvas);
// //
// // canvasField.addEventListener("mouseup", canvas);
// // canvasField.removeEvenListener("mousedown", canvas);
// canvasField.addEventListener("mousedown", canvas);

// canvasField.removeEventListener("mousedown", canvas);
// canvasField.addEventListener("mouseup", function() {
// });
// canvasField.removeEventListener("mousemove", mouseMove);
