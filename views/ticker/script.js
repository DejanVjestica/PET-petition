console.log("yeah");
$(document).ready(function() {
    // global variables
    var elem = $("#ticker"); // this is parent element from all links
    var left = elem.offset().left; // it gets ticker position x axis to left
    var animId;

    // var link; //  selects individual links
    // ==========================================================
    // AJAX request
    // ==========================================================
    $.ajax({
        url: "/links.json",
        method: "GET",
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                elem.append(
                    "<a href=" + data[i].link + ">" + data[i].text + "</a>"
                );
            }
            // link = $("a");
        }
    });
    // ==================================
    // It makes it run
    // ==================================
    function fn() {
        var link = $("a"); //  selects individual links
        left -= 3;
        // removing a link from index 0
        // link = link.map();
        // console.log(link);
        if (left < -link.eq(0).outerWidth()) {
            left += link.eq(0).outerWidth();
            link.eq(0).appendTo(elem);
            link = $("a");
        }
        animId = requestAnimationFrame(fn);
        elem.css({ left: left + "px" });
    }
    fn();
    $(document).on("mouseenter", "#ticker", function() {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        } else {
            fn();
        }
    });
    $(document).on("mouseleave", "#ticker", function() {
        fn();
    });
});

// ===============================================
// Vanila JS vorking
// ===============================================
// (function() {
//     // var elemContainer = document.getElementById("container");
//     var elem = document.getElementById("ticker"); //HTML div
//     var left = elem.offsetLeft; //Position of container
//     var link = document.getElementsByTagName("a"); //Array of links
//     var animId;
//
//     function fn() {
//         left -= 1;
//         animId = requestAnimationFrame(fn);
//         // removing a link from index 0
//         if (left < -link[0].offsetWidth) {
//             left += link[0].offsetWidth;
//             elem.appendChild(link[0]);
//         }
//         elem.style.left = left + "px";
//     }
//     fn();
//     elem.addEventListener("mouseenter", function() {
//         if (animId) {
//             cancelAnimationFrame(animId);
//             animId = null;
//         } else {
//             fn();
//         }
//     });
//     elem.addEventListener("mouseleave", function() {
//         fn();
//     });
// })();
//
// var animId;
// var animId = requestAnimationFrame();
// canselAnimationFrame(val);

// ===============================================================
// Jquery version
// ===============================================================
