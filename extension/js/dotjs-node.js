var site = window.location.hostname.replace(/^www\./, "");

$.get("https://localhost:3131/" + site + ".js", function(response) {
  $(document).ready(function() {
    eval(response);
  });
});
