let user;
let enemy;
let gameState = false;
let game = 'game0';
let ready = false;
let name;

let phrases = ['Say hi...', 'Maybe some smack talk?', 'Chat here!', "Tell them what's up!", 'Throw some shade...']

let chats = [];

let wins = 0;
let losses = 0;

/* #region  firebaseinit */
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

/* #endregion */

/* #region  func dec */
function joinGame(mode) {
    // TODO find way to search all games
}

function createGame() {
    game = $('#game-name').val();
    database.ref('rps/' + game).set({
        chat: '',
        user1: {
            choice: '',
            losses: 0,
            name: '',
            status: false,
            wins: 0
        },
        user2: {
            choice: '',
            losses: 0,
            name: '',
            status: false,
            wins: 0
        }
    });
    createDBListeners();
}

function randomPhrase() {
    let phrase = phrases[Math.floor(Math.random() * phrases.length)];
    $('#chat-input').attr('placeholder', phrase);
}

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

function showChatOnStart() {
    if (parseInt(window.innerWidth) > 480) {
        $('#chat').show('slow');
    }
}

function reset() {
    database.ref('rps/' + game + '/user1/status').set(false);
    database.ref('rps/' + game + '/user2/status').set(false);
    database.ref('rps/' + game + '/user1/choice').set('');
    database.ref('rps/' + game + '/user2/choice').set('');
    database.ref('rps/' + game + '/chat').set('');
}

/* #endregion */

randomPhrase();

/* #region  click events */
// click events
$('#find-game').on('click', '.join-game', function () {
    $('#find-game').hide('slow');
    $('#name-prompt').show('slow');
});

$('#create-game').on('click', function () {
    $('#find-game').html('<h2>Create Game</h2><hr><input type="text" id="game-name"><button id="create" class="#join-game">Create</button><small id="error"></small>');
});

$('#find-game').on('click', '#create', function () {
    if ($('#game-name').val()) {
        createGame();
        $('#find-game').hide('slow');
        $('#name-prompt').show('slow');
    } else {
        $('#error').text('Please type a name for the game');
    }
});

$('#join').on('click', function () {
    event.preventDefault();
    name = $('#name-input').val();
    if (name) {
        database.ref('rps/' + game).once('value').then(function (snapshot) {
            let data = snapshot.val();
            if (!data.user1.status) {
                gameState = true;
                user = 'user1';
                enemy = 'user2';
                $('#name-prompt').hide('slow');
                showHidden();
                showChatOnStart();
            } else if (!data.user2.status) {
                gameState = true;
                user = 'user2';
                enemy = 'user1';
                $('#name-prompt').hide('slow');
                showHidden();
                showChatOnStart();
            } else {
                $('#error').text('Sorry, there are no available spots...');
            }
            database.ref('rps/' + game + '/' + user + '/status').set(true);
            database.ref('rps/' + game + '/' + user + '/name').set(name);
            createDBListeners();
        });
    } else {
        $('#error').text('Please enter a name');
    }
});

$('.player-choice').on('click', function () {
    ready = true;
    database.ref('rps/' + game + '/' + user + '/choice').set($(this).attr('data-move'));
    hide();
});

$('#leave').on('click', function () {
    database.ref('rps/' + game + '/' + user + '/status').set(false);
    database.ref('rps/' + game + '/' + user + '/choice').set('');
    user = '';
    enemy = '';
    gameState = false;
    document.write('GOODBYE');
    // TODO reset scores in db to zero, display that the opponent has left
});

$('#reset').on('click', reset);

$('#send').on('click', function () {
    event.preventDefault();
    database.ref('rps/' + game + '/chat').push('<strong>' + name + ':</strong> ' + $('#chat-input').val());
    $('#chat-input').val('');
    randomPhrase();
});

$('#show-chat').on('click', function () {
    $('#chat').show('slow');
    $('#show-chat').hide('fast');
    $('#show-chat').attr('style', '');
});

$('#hide-chat').on('click', function () {
    $('#chat').hide('slow');
    $('#show-chat').show('fast');
    $('#show-chat').attr('style', '');
});

/* #endregion */

function createDBListeners() {
    database.ref('rps/' + game).on('value', function (parentData) {
        let stuff = parentData.val();
        if (!stuff.user1.status && !stuff.user2.status) {
            database.ref('rps/' + game + '/chat').set('');
            $('#show-chat').attr('style', '');

        }

        if (gameState) {
            // too lazy to rewrite... should be way simpler since the data already exists. Shrug
            database.ref('rps/' + game + '/' + enemy).once('value').then(function (snapshot) {
                let data = snapshot.val();
                if (data.status) {
                    $('#enemy-name').text(data.name);
                }
                if (data.choice) {
                    $('#enemy-choice').attr('src', './assets/images/' + data.choice + '.png');
                }
            });
            database.ref('rps/' + game + '/' + user).once('value').then(function (snapshot) {
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
                database.ref('rps/' + game + '/' + user + '/choice').set('');
                $('#enemy-choice').show('slow');
                setTimeout(() => {
                    gameEnd(end);
                    $('#enemy-choice').hide('slow');
                    $('#wins').text(wins);
                    $('#losses').text(losses);
                }, 1000);
                console.log(wins, losses);
                // TODO push wins and losses to db, make them display on opponent's screen
            }
        }
    });

    database.ref('rps/' + game + '/chat').on('value', function (snapshot) {
        if (!snapshot.val()) {
            $('#chat-history').empty();
        }
    });

    database.ref('rps/' + game + '/chat').on('child_added', function (childSnapshot) {
        console.log(childSnapshot.val());
        let data = childSnapshot.val();
        let p = $('<p>').html(data);
        let ch = document.getElementById('chat-history')
        $('#chat-history').append(p);
        ch.scrollTop = ch.scrollHeight;    
        $('#show-chat').attr('style', 'background-color:red');
    });

}

/* #region  draggable elements */
// Draggable code - borrowed for the sake of experimentation
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

/* #endregion */