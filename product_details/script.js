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

async function loadcard() {
    const response = await fetch('../components/card.html');
    const card = await response.text();
    for (let i = 0; i < 5; i++) {
        document.getElementById('product_card_' + i).innerHTML += card;
    }

}

loadcard();
loadfooter();
loadheader();


