var site = window.location.hostname.replace(/^www\./, "");

$.get("http://localhost:3131/" + site + ".js", function(response) {
  $(document).ready(function() {
    eval(response);
  });
});
