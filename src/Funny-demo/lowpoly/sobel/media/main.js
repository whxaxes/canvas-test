window.onload = function () {
    /* kernel selector */
    var kernelSetting = window.location.search.substring(1).split("&");
    kernelSetting = (kernelSetting.length > 1) ? parseInt(kernelSetting[1].split('k=')[1]): 0;

    /* image selector */
    var images = [
        "7AM5JEn",
        "dwrtxlP",
        "lCoYP4z",
        "w8dK7fg",
        "rmjWVSN",
    ];
    var imgsel = document.getElementById('image-selector');
    for (var i=0; i < images.length; i++) {
        var atag = document.createElement("a");
        atag.setAttribute("href", "index.html?img=" + i + "&k=" + kernelSetting);
        var imgtag = document.createElement("img");
        imgtag.setAttribute("src", "images/" + images[i] + "_t.jpg");
        imgtag.setAttribute("width", "96px");
        imgtag.setAttribute("height", "96px");
        atag.appendChild(imgtag);
        imgsel.appendChild(atag);
    }

    /* calculation */
    var imgId = parseInt(window.location.search.substring(1).split("&")[0].split('img=')[1]) || 0;
    if ((images.length - 1) < imgId) {
        imgId = 0;
    }

    var kernel;
    if (kernelSetting == 0) {
        kernel = [
            [ 1, 2, 1],
            [ 0, 0, 0],
            [-1,-2,-1],
        ];
    } else if (kernelSetting == 1) {
        kernel = [
            [ 1, 0,-1],
            [ 2, 0,-2],
            [ 1, 0,-1],
        ];
    } else {
        kernel = [
            [ 1, 1, 0],
            [ 1, 0,-1],
            [ 0,-1,-1],
        ];
    }

    /* direction controller */
    var dcontrol = document.getElementById('direction-controller');
    ["x", "y", "all"].forEach(function (name, kId) {
        var atag = document.createElement("a");
        atag.setAttribute("href", "index.html?img=" + imgId + "&k=" + kId);
        var stag = document.createElement("span");
        stag.innerHTML = name + " ";
        atag.appendChild(stag);
        dcontrol.appendChild(atag);
    });

    /* let's calculate! */
    var image = document.getElementById('image');
    image.crossOrigin = "anonymous";
    image.src = "images/" + images[imgId] + ".jpg";
    image.onload = function() {
        var sobel = new Sobel({
            element: "image",
            kernel: kernel,
            size: 400,
        });
        sobel.calc();
    };
}
