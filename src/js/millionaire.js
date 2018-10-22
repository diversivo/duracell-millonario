/**
* Edits the number prototype to allow money formatting
*
* @param fixed the number to fix the decimal at. Default 2.
* @param decimalDelim the string to deliminate the non-decimal
*        parts of the number and the decimal parts with. Default "."
* @param breakdDelim the string to deliminate the non-decimal
*        parts of the number with. Default ","
* @return returns this number as a USD-money-formatted String
*		  like this: x,xxx.xx
*/
Number.prototype.money = function (fixed, decimalDelim, breakDelim) {
	var n = this,
		fixed = isNaN(fixed = Math.abs(fixed)) ? 2 : fixed,
		decimalDelim = decimalDelim == undefined ? "." : decimalDelim,
		breakDelim = breakDelim == undefined ? "," : breakDelim,
		negative = n < 0 ? "-" : "",
		i = parseInt(n = Math.abs(+n || 0).toFixed(fixed)) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;
	return negative + (j ? i.substr(0, j) +
		breakDelim : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + breakDelim) +
		(fixed ? decimalDelim + Math.abs(n - i).toFixed(fixed).slice(2) : "");
}

/**
* Plays a sound via HTML5 through Audio tags on the page
*
* @require the id must be the id of an <audio> tag.
* @param id the id of the element to play
* @param loop the boolean flag to loop or not loop this sound
*/
startSound = function (id, loop) {
	soundHandle = document.getElementById(id);
	if (loop)
		soundHandle.setAttribute('loop', loop);
	soundHandle.play();
}

/**
* The View Model that represents one game of
* Who Wants to Be a Millionaire.
* 
* @param data the question bank to use
*/
var MillionaireModel = function (data) {
	var self = this;

	// The 15 questions of this game
	this.questions = data.questions;

	// A flag to keep multiple selections
	// out while transitioning levels
	this.transitioning = false;

	// The current money obtained
	this.money = new ko.observable(0);

	// The current level(starting at 1) 
	this.level = new ko.observable(1);

	// The three options the user can use to 
	// attempt to answer a question (1 use each)
	this.usedFifty = new ko.observable(false);
	this.usedPhone = new ko.observable(false);
	this.usedAudience = new ko.observable(false);

	self.setTimer = function () {
		// Set the date we're counting down to
		var timeObject = new Date();
		var seconds = timeObject.getSeconds() + 51;
		var countDownDate = timeObject.setSeconds(seconds);


		// Update the count down every 1 second
		var x = setInterval(function () {

			// Get todays date and time
			var now = new Date().getTime();

			// Find the distance between now and the count down date
			var distance = countDownDate - now;

			// Time calculations for days, hours, minutes and seconds
			var seconds = Math.floor((distance % (1000 * 60)) / 1000);

			// Display the result in the element with id="demo"
			document.getElementById("time").innerHTML = `${seconds + "s"}`;
			console.log(`${seconds + "s"}`);
			
			// If the count down is finished, write some text 
			if (distance < 0) {
				clearInterval(x);
				document.getElementById("time").innerHTML = "TIEMPO";
				self.wrongAnswer('time');
			}
		}, 1001);
	}

	this.setTimer();

	// Grabs the question text of the current question
	self.getQuestionText = function () {
		return self.questions[self.level() - 1].question;
	}

	// Gets the answer text of a specified question index (0-3)
	// from the current question
	self.getAnswerText = function (index) {
		return self.questions[self.level() - 1].content[index];
	}

	// Uses the fifty-fifty option of the user
	self.fifty = function (item, event) {
		if (self.transitioning)
			return;
		$(event.target).fadeOut('slow');
		var correct = this.questions[self.level() - 1].correct;
		var first = (correct + 1) % 4;
		var second = (first + 1) % 4;
		if (first == 0 || second == 0) {
			$("#answer-one").fadeOut('slow');
		}
		if (first == 1 || second == 1) {
			$("#answer-two").fadeOut('slow');
		}
		if (first == 2 || second == 2) {
			$("#answer-three").fadeOut('slow');
		}
		if (first == 3 || second == 3) {
			$("#answer-four").fadeOut('slow');
		}
	}

	// Fades out an option used if possible
	self.fadeOutOption = function (item, event) {
		if (self.transitioning)
			return;
		$(event.target).fadeOut('slow');
	}

	// Attempts to answer the question with the specified
	// answer index (0-3) from a click event of elm
	self.answerQuestion = function (index, elm) {
		if (self.transitioning)
			return;
		self.transitioning = true;
		if (self.questions[self.level() - 1].correct == index) {
			self.rightAnswer(elm);
		} else {
			self.wrongAnswer(elm);
		}
	}

	// Executes the proceedure of a correct answer guess, moving
	// the player to the next level (or winning the game if all
	// levels have been completed)
	self.rightAnswer = function (elm) {
		$("#" + elm).slideUp('slow', function () {
			startSound('rightsound', false);
			$("#" + elm).css('background', 'green').slideDown('slow', function () {
				self.money($(".active").data('amt'));
				if (self.level() + 1 > 3) {
					$("#game").fadeOut('slow', function () {
						$("#game-win").fadeIn('slow');
					});
				} else {
					self.level(self.level() + 1);
					$("#" + elm).css('background', 'linear-gradient(180deg,rgb(6, 1, 1),rgba(43, 20, 7, 0.7))');
					$("#answer-one").show();
					$("#answer-two").show();
					$("#answer-three").show();
					$("#answer-four").show();
					self.transitioning = false;
				}
			});
		});
	}

	// Executes the proceedure of guessing incorrectly, losing the game.
	self.wrongAnswer = function (elm) {
		$("#" + elm).slideUp('slow', function () {
			startSound('wrongsound', false);
			if (elm !== 'time') {
				$("#" + elm).css('background', 'red').slideDown('slow', function () {
					$("#game").fadeOut('slow', function () {
						//$("#game-over").html('Game Over!');
						$("#game-over").fadeIn('slow');
						self.transitioning = false;
					});
				});
			} else {
				$("#" + elm).slideDown('slow', function () {
					$("#game").fadeOut('slow', function () {
						//$("#game-over").html('Game Over!');
						$("#game-over").fadeIn('slow');
						self.transitioning = false;
					});
				});
			}
		});
	}

	// Gets the money formatted string of the current won amount of money.
	self.formatMoney = function () {
		return self.money().money(2, '.', ',');
	}
};

// Executes on page load, bootstrapping
// the start game functionality to trigger a game model
// being created
$(document).ready(function () {
	$.getJSON("questions.json", function (data) {
		for (var i = 1; i <= data.games.length; i++) {
			$("#problem-set").append('<option value="' + i + '">' + i + '</option>');
		}
		$("#pre-start").show();
		$("#start").click(function () {
			var index = $('#problem-set').find(":selected").val() - 1;
			ko.applyBindings(new MillionaireModel(data.games[index]));
			$("#pre-start").fadeOut('slow', function () {
				startSound('background', true);
				$("#game").fadeIn('slow').css("display", "grid");
			});
		});
	});
});

window.human = false;

var canvasEl = document.querySelector('.fireworks');
var ctx = canvasEl.getContext('2d');
var numberOfParticules = 30;
var pointerX = 0;
var pointerY = 0;
var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
var colors = ['#ff7e00', '#ff9f1e', '#fff447', '#FBF38C'];

function setCanvasSize() {
  canvasEl.width = window.innerWidth * 2;
  canvasEl.height = window.innerHeight * 2;
  canvasEl.style.width = window.innerWidth + 'px';
  canvasEl.style.height = window.innerHeight + 'px';
  canvasEl.getContext('2d').scale(2, 2);
}

function updateCoords(e) {
  pointerX = e.clientX || e.touches[0].clientX;
  pointerY = e.clientY || e.touches[0].clientY;
}

function setParticuleDirection(p) {
  var angle = anime.random(0, 360) * Math.PI / 180;
  var value = anime.random(50, 180);
  var radius = [-1, 1][anime.random(0, 1)] * value;
  return {
    x: p.x + radius * Math.cos(angle),
    y: p.y + radius * Math.sin(angle)
  }
}

function createParticule(x,y) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = colors[anime.random(0, colors.length - 1)];
  p.radius = anime.random(16, 32);
  p.endPos = setParticuleDirection(p);
  p.draw = function() {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  return p;
}

function createCircle(x,y) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = '#FFF';
  p.radius = 0.1;
  p.alpha = .5;
  p.lineWidth = 6;
  p.draw = function() {
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.lineWidth = p.lineWidth;
    ctx.strokeStyle = p.color;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  return p;
}

function renderParticule(anim) {
  for (var i = 0; i < anim.animatables.length; i++) {
    anim.animatables[i].target.draw();
  }
}

function animateParticules(x, y) {
  var circle = createCircle(x, y);
  var particules = [];
  for (var i = 0; i < numberOfParticules; i++) {
    particules.push(createParticule(x, y));
  }
  anime.timeline().add({
    targets: particules,
    x: function(p) { return p.endPos.x; },
    y: function(p) { return p.endPos.y; },
    radius: 0.1,
    duration: anime.random(1200, 1800),
    easing: 'easeOutExpo',
    update: renderParticule
  })
    .add({
    targets: circle,
    radius: anime.random(80, 160),
    lineWidth: 0,
    alpha: {
      value: 0,
      easing: 'linear',
      duration: anime.random(600, 800),  
    },
    duration: anime.random(1200, 1800),
    easing: 'easeOutExpo',
    update: renderParticule,
    offset: 0
  });
}

var render = anime({
  duration: Infinity,
  update: function() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
});

// document.addEventListener(tap, function(e) {
//   window.human = true;
//   render.play();
//   updateCoords(e);
//   animateParticules(pointerX, pointerY);
// }, false);

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;

 function autoClick() {
   if (window.human) return;
   animateParticules(
     anime.random(centerX-50, centerX+50), 
     anime.random(centerY-50, centerY+50)
   );
   anime({duration: 200}).finished.then(autoClick);
 }

autoClick();
setCanvasSize();
window.addEventListener('resize', setCanvasSize, false);