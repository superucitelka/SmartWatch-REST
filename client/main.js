$(function () {
  let map = L.map("map").setView([50.000, 17.000], 18);
  let inputmap = L.map("inputmap").setView([50.0, 18.0], 10);
  let videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
    videoBounds = [[ 50, 17], [ 50.5, 17.5]];
  inputmap.on('click', function(event) {
    console.log(event);
    fetch("http://localhost:3000/api/gps", {
      method: "POST",
      body: JSON.stringify(event.latlng),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });    
  });
  let tilesinput = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      maxZoom: 18,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
    }
  ).addTo(inputmap); 
  L.videoOverlay(videoUrl, videoBounds, {opacity: 0.5} ).addTo(inputmap);

  $("[type=range]").on("change", function () {
    $(this).prev().find("b").text($(this).val());
    fetch("http://localhost:3000/api/color", {
      method: "POST",
      body: JSON.stringify({
        red: $("#red").val(),
        green: $("#green").val(),
        blue: $("#blue").val(),
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
  });

  $("#addalert").on("click", function () {
    fetch("http://localhost:3000/api/alerts", {
      method: "POST",
      body: JSON.stringify({
        time: $("#timealert").val(),
        message: $("#message").val(),
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
  });

  let action = ["date", "time", "color", "gps"];

  function updateValues() {
    action.forEach(function (value) {
      fetch(`http://localhost:3000/api/${value}`, {
        method: "GET",
        headers: {
          "Content-type": "application/text; charset=UTF-8",
        },
      })
        .then((response) => response.text())
        .then((text) => (document.getElementById(value).innerText = text));
    });
    document.querySelector(".jumbotron.vypis").style.backgroundColor =
      document.getElementById("color").innerText;

    let alertsList = [];
    fetch(`http://localhost:3000/api/alerts`, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        alertsList = json;
        alertsList.sort(function (a, b) {
          timeA = a.time.replace(":", "");
          timeB = b.time.replace(":", "");
          return timeA - timeB;
        });
        $("#alerts").text("");
        alertsList.forEach(function (values) {
          $("#alerts").append(
            `<li><b>${values.time}</b> ${values.message}</li>`
          );
        });
      });

    let now = new Date().toLocaleTimeString().split(":");
    fetch(`http://localhost:3000/api/alerts?time=${now[0]}:${now[1]}`, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.length > 0) {
          $("#alertbanner").html(
            `<p class="jumbotron bg-danger display-4 text-warning text-center">${json[0].time}\n${json[0].message}</div>`
          );
        } else {
          $("#alertbanner").html("");
        }
      })
      .catch((error) => console.log("No alert", error));

    let position = JSON.parse(document.getElementById('gps').innerText);
    map.setView([position.w, position.l], 18) 
    let tiles = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        maxZoom: 18,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
      }
    ).addTo(map);
    let marker = L.marker([position.w, position.l]).addTo(map);
    /*let circle = L.circle([position.w, position.l], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 10
    }).addTo(map);*/
  }


  setInterval(updateValues, 1000);
});
