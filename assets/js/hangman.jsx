import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function game_init(root, channel) {
  ReactDOM.render(<HangmanGame channel={channel} />, root);
}

// App state for Hangman is:
// {
//    word: String    // the word to be guessed
//    guesses: String // letters guessed so far
// }
//
// A TodoItem is:
//   { name: String, done: Bool }


class HangmanGame extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.state = { skel: "", goods: [], bads: [], max: 10 };

    this.channel.join()
        .receive("ok", this.gotView.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp) });
  }

  gotView(view) {
    console.log("New view", view);
    this.setState(view.game);
  }

  sendGuess(ev) {
    this.channel.push("guess", { letter: ev.key })
        .receive("ok", this.gotView.bind(this));
  }

  render() {
    return (
      <div className="row">
        <div className="col-6">
          <Word state={this.state} />
        </div>
        <div className="col-6">
          <Lives state={this.state} />
        </div>
        <div className="col-6">
          <Guesses state={this.state} />
        </div>
        <div className="col-6">
          <GuessInput guess={this.sendGuess.bind(this)} />
        </div>
      </div>
    );
  }
}

function Word(params) {
  let state = params.state;

  let letters = _.map(state.skel, (xx, ii) => {
    return <span style={{padding: "1ex"}} key={ii}>{xx}</span>;
  });

  return (
    <div>
      <p><b>The Word</b></p>
      <p>{letters}</p>
    </div>
  );
}

function Lives(params) {
  let state = params.state;

  return <div>
    <p><b>Guesses Left:</b></p>
    <p>{state.max - state.bads.length}</p>
  </div>;
}

function Guesses(params) {
  let state = params.state;

  return <div>
    <p><b>Bad Guesses</b></p>
    <p>{state.bads.join(" ")}</p>
  </div>;
}

function GuessInput(params) {
  return <div>
    <p><b>Type Your Guesses</b></p>
    <p><input type="text" onKeyPress={params.guess} /></p>
  </div>;
}
