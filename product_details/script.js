async function loadheader() {
    const response = await fetch('../components/header_logged_in.html');
    const header = await response.text();
    document.getElementById('head').innerHTML = header;

}
async function loadfooter() {
    const response = await fetch('../components/footer.html');
    const header = await response.text();
    document.getElementById('foot').innerHTML = header;

}

loadfooter();
loadheader();


