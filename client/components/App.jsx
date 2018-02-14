import React from 'react';
import axios from 'axios';

class App extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			messages: [],
			message: '',
			name: '',
			enteredName: false,
			isLoggedIn: false
		}
	}

	componentWillMount() {
		axios.defaults.withCredentials = true
		axios.get('http://127.0.0.1:3304/home')
		  .then((res) => {
		  	if (res.data.isLoggedIn) {
		  		// console.log('IS LOGGED IN', res.data.isLoggedIn)
		  		this.setState({messages: res.data.messages, isLoggedIn: res.data.isLoggedIn, name: res.data.name, enteredName: true})
		  	} else {
		  		// console.log('NOT LOGGED IN', res.data);
		  		this.setState({messages: [], isLoggedIn: false, name: ''})
		  	}
		  })
		  .catch((err) => console.log('you suck....did not get message'))
	}

	// *** React's lifecycle methods ***
	updateMessages() {
		// console.log("UPDATE CALLED")
		axios.get('http://127.0.0.1:3304/getMessages')
		  .then((res) => {
		  	this.setState({messages: res.data})
		  })
		  .catch((err) => console.log('you suck....did not get message'))
	}

	renderMessages() {
		return (
			<div>
			  {
			  	this.state.messages.map( mesg => {
				  	return <p style={{fontSize: "16px"}}> {mesg} </p>
			  	})
				}
			</div>
		)
	}

	sendToServer(e) {
		e.preventDefault()
		axios.defaults.withCredentials = true
		// console.log('SENDING MESSAGE')
		axios.post('http://127.0.0.1:3304/postMessage', {message: `${this.state.name}: ${this.state.message}`})
		  .then(() => {
				this.updateMessages()
				this.setState({message: ''})
		  })
	}

	setName(e) {
		e.preventDefault()
		e.persist()
		// console.log('name', e.target.name.value !== '')
		if (e.target.name.value !== '') {
			axios.defaults.withCredentials = true
			var name = e.target.name.value
			if (name === 'Josh' || name === 'josh' || name === 'Joshua' || name === 'joshua' || name === 'j-dizzle' || name === 'jdizzle' || name === 'J-Dizzle' || name === 'J-dizzle') {
				name = "I\'m garbage!"
			}
			console.log('NAME IS', name)
			axios.post('http://127.0.0.1:3304/logIn', {name: name})
			  .then((res) => {
			  	// console.log('LOGIN RESPONSE', res)
			    this.setState({enteredName: true, name: name, messages: res.data.messages})
			    // this.updateMessages()
			  })
		} else {
			alert("Can't be anonymous....NOT TAADAAAYYY")
		}
	}

	setMessage(e) {
		e.preventDefault()
		this.setState({message: e.target.value})
	}

	// *** End of lifecycle methods ***

	render() {
		return (
			<div>
			{!this.state.enteredName ?
			  <form onSubmit={this.setName.bind(this)}>
				  <input type="text" placeholder="enter session name" name="name"/>
				  <button> Submit </button>
			  </form>
			:
				<div style={{fontSize: "30px"}}>
				  <p>Logged in as: {this.state.name}</p>
				  <form onSubmit={this.sendToServer.bind(this)}>
					  <input onChange={this.setMessage.bind(this)} value={this.state.message} style={{width: "75%"}} type="text" placeholder="enter message here"/>
					  <button> Send </button>
				  </form>
				  {this.renderMessages()}
				</div>
			}
			</div>
		)
	}
}

export default App