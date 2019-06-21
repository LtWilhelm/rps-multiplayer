let user;
let enemy;
let gameState = false;
let games = ['game0'];
let gameIndex = 0;
let ready = false;
let name;

let chats = [];

let wins = 0;
let losses = 0;

let firebaseConfig = {
    apiKey: "AIzaSyCfu5kEk-9UxRv2-F3Qa6hELFINV1GUPVM",
    authDomain: "lernding.firebaseapp.com",
    databaseURL: "https://lernding.firebaseio.com",
    projectId: "lernding",
    storageBucket: "lernding.appspot.com",
    messagingSenderId: "20200720094",
    appId: "1:20200720094:web:c2f2c5d0028d3ea2"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const ref = firebase.database().ref('rps');

function compare(choice1, choice2) {
    switch (choice1 + "-" + choice2) {
        case 'attack-attack':
        case 'shield-shield':
        case 'magic-magic':
            return 'draw';
            break;
        case 'attack-magic':
        case 'shield-attack':
        case 'magic-shield':
            return 'user1';
            break;
        case 'attack-shield':
        case 'shield-magic':
        case 'magic-attack':
            return 'user2';
            break;
    }
}

function showHidden() {
    $('#buttons').show('slow');
}
function hide() {
    $('#buttons').hide('slow');
}

function gameEnd(result) {
    $('#result').text(result);
    $('#result').show('slow');
    setTimeout(function () {
        $('#result').hide('fast');
        showHidden();
    }, 1500);
}

// click events
$('#join').on('click', function () {
    name = $('#name-input').val();
    if (name) {
        database.ref('rps/' + games[gameIndex]).once('value').then(function (snapshot) {
            let data = snapshot.val();
            if (!data.user1.status) {
                gameState = true;
                user = 'user1';
                enemy = 'user2';
                $('#name-prompt').hide('slow');
                showHidden();
                $('#chat').show('slow');
            } else if (!data.user2.status) {
                gameState = true;
                user = 'user2';
                enemy = 'user1';
                $('#name-prompt').hide('slow');
                showHidden();
                $('#chat').show('slow');
            } else {
                $('#error').text('Sorry, there are no available spots...');
            }
            database.ref('rps/' + games[gameIndex] + '/' + user + '/status').set(true);
            database.ref('rps/' + games[gameIndex] + '/' + user + '/name').set(name);
        });
    } else {
        $('#error').text('Please enter a name');
    }

});

$('.player-choice').on('click', function () {
    ready = true;
    database.ref('rps/' + games[gameIndex] + '/' + user + '/choice').set($(this).attr('data-move'));
    hide();
});

$('#leave').on('click', function () {
    database.ref('rps/' + games[gameIndex] + '/' + user + '/status').set(false);
    user = '';
    enemy = '';
    gameState = false;
    document.write('GOODBYE');
});

$('#reset').on('click', function () {
    database.ref('rps/game0/user1/status').set(false);
    database.ref('rps/game0/user2/status').set(false);
    database.ref('rps/' + games[gameIndex] + '/chat').set('');
});

$('#send').on('click', function () {
    event.preventDefault();
    database.ref('rps/' + games[gameIndex] + '/chat').push('<strong>' + name + ':</strong> ' +  $('#chat-input').val());
    $('#chat-input').val('');
});

$('#show-chat').on('click', function(){
    $('#chat').show('slow');
    $('#show-chat').hide('fast');
});

$('#hide-chat').on('click', function(){
    $('#chat').hide('slow');
    $('#show-chat').show('fast');
});

// Firebase update events
database.ref('rps/' + games[gameIndex]).on('value', function (parentData) {
    let stuff = parentData.val();
    if (!stuff.user1.status && !stuff.user2.status) {
        database.ref('rps/' + games[gameIndex] + '/chat').set('');
    }
    
    if (gameState) {
        // too lazy to rewrite... should be way simpler since the data already exists. Shrug
        database.ref('rps/' + games[gameIndex] + '/' + enemy).once('value').then(function (snapshot) {
            let data = snapshot.val();
            if (data.status) {
                $('#enemy-name').text(data.name);
            }
            if (data.choice) {
                $('#enemy-choice').attr('src', './assets/images/' + data.choice + '.png');
            }
        });
        database.ref('rps/' + games[gameIndex] + '/' + user).once('value').then(function (snapshot) {
            let data = snapshot.val();
            if (data.status) {
                $('#friendly-name').text(data.name);
            }
        });

        if (stuff.user1.choice && stuff.user2.choice && ready) {
            ready = false;
            let result = compare(stuff.user1.choice, stuff.user2.choice);
            let end;
            switch (result) {
                case user:
                    console.log('win');
                    wins++;
                    end = 'Victory!';
                    break;
                case enemy:
                    console.log('lose');
                    losses++;
                    end = 'Defeat!';
                    break;
                case 'draw':
                    console.log('draw');
                    end = 'Draw!';
                    break;
            }
            database.ref('rps/' + games[gameIndex] + '/' + user + '/choice').set('');
            $('#enemy-choice').show('slow');
            setTimeout(() => {
                gameEnd(end);
                $('#enemy-choice').hide('slow');
            }, 1000);
            console.log(wins, losses);
        }
    }
});

database.ref('rps/' + games[gameIndex] + '/chat').on('value', function(snapshot){
    if (!snapshot.val()){
        $('#chat-history').empty();
    }
});


database.ref('rps/' + games[gameIndex] + '/chat').on('child_added', function(childSnapshot){
    console.log(childSnapshot.val());
    let data = childSnapshot.val();
    let p = $('<p>').html(data);
    $('#chat-history').append(p);
});

// Draggable code
dragElement(document.getElementById('chat'));

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
