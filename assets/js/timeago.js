function render(n, unit) {
  return n + " " + unit + ((n == 1) ? "" : "s") + " ago";
}
const labels = ["year", "month", "day", "hour", "minute", "second"];
const products = [1, 60, 60, 24, 30, 365].map((n, i, a) => a.slice(0, a.length-i).reduce((p, n) => p * n, 1));

function ago(date) {
  var seconds = Math.floor((new Date() - Date.parse(date)) / 1000);
  return labels.reduce((res, lab, i) => {
    const interval = Math.floor(seconds / products[i]);
    return res ? res : interval >= 1 ? render(interval, lab) : "";
  }, "");
}


document.querySelectorAll("[id^=postedon]").forEach(el =>
  el.querySelector('#' + el.id.replace('postedon', 'postedago')).textContent = ago(el.getAttribute("datetime"))
);
