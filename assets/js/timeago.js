import en from './en.json.js'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

function ago(date) {
  return timeAgo.format(Date.parse(date));
}

document.querySelectorAll("[id^=postedon]").forEach(el =>
  el.querySelector('#' + el.id.replace('postedon', 'postedago'))
  .textContent = ago(el.getAttribute("datetime"))
);

