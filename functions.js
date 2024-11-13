import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// High Contrast Mode Toggle
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('.icon-brightness-contrast').addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
    });

    // Draw the Timeline after the page loads
    drawTimeline(timelineData);
});

// Function to open the popup
function openPopup(popupId) {
    document.getElementById(popupId).style.display = "block";
}

// Function to close the popup
function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}



// Customized dataset for education journey
var educationJourney = [
    {name: "Case Western Reserve", times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}], gpa: "4.0", comment: ""},
    {name: "Cornell", times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}, {"starting_time": 1355752800000, "ending_time": 1355759900000}], gpa: "3.57", comment: "" },
    {name: "Tsinghua", times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}], gpa: "4.0", comment: "" },
    {name: "Stanford", times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}], gpa: "3.97", comment: "" }
];

var chart = d3.timeline();
var svg = d3.select("#timeline").append("svg").attr("width", 500)
  .datum(educationJourney).call(chart);