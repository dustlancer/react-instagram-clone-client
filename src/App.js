import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import Post from './components/post/Post';
import { Button, Input, Modal, makeStyles } from '@material-ui/core';

const BASE_URL = 'http://127.0.0.1:8000/'

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  }
}

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    width: 400,
    border: `2px solid #000`,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2,4,3)
  }
}))


function App() {
  const classes = useStyles();

  const [posts, setPosts] = useState([]);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [modalStyle, setModalStyle] = useState(getModalStyle);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState(null);
  const [authTokenType, setAuthTokenType] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    authToken
      ? window.localStorage.setItem("authToken", authToken)
      : window.localStorage.removeItem("authToken")
    authTokenType
      ? window.localStorage.setItem("authTokenType", authTokenType)
      : window.localStorage.removeItem("authTokenType")
    username
      ? window.localStorage.setItem("username", username)
      : window.localStorage.removeItem("username")
    userId
      ? window.localStorage.setItem('userId', userId)
      : window.localStorage.removeItem('userId')
  }, [authToken, authTokenType, userId])


  useEffect(() => {
    fetch(BASE_URL + 'post/all')
        .then(response => {
          const json = response.json();
          console.log(json);
          
          if (response.ok) {
            return json;
          }
          throw response
        })
        .then(data => {
          const result = data.sort((a, b) => {
            const t_a = a.timestamp.split(/[-T:]/);
            const t_b = b.timestamp.split(/[-T:]/);
            const date_a = new Date(Date.UTC(t_a[0], t_a[1]-1, t_a[2], t_a[3], t_a[4], t_a[5]));
            const date_b = new Date(Date.UTC(t_b[0], t_b[1]-1, t_b[2], t_b[3], t_b[4], t_b[5]));
            return date_b - date_a
          })
          return result
        })
        .then(data => {
          setPosts(data)
        })
        .catch(error => {
          console.log(error);
          alert(error);
        })
  }, []);

  const signIn = (event) => {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append('username', username);
    formdata.append('password', password);
    
    const requestOptions = {
      method: 'POST',
      body: formdata
    }

    fetch(BASE_URL+'login', requestOptions)
        .then(response => {
          if (response.ok) {
            return response.json()
          }
          throw response
        })
        .then(data => {
          console.log(data);
          setAuthToken(data.access_token);
          setAuthTokenType(data.roken_type);
          setUserId(data.user_id);
          setUsername(data.username)
        })
        .catch(err => {
          console.log(err);
          alert(err);
        })

    setOpenSignIn(false);
  };

  const signOut = (event) => {
    setAuthToken(null);
    setAuthTokenType(null);
    setUserId("");
    setUsername("");
  }


  return (
    <div className='app'>

      <Modal
          open={openSignIn}
          onClose={() => setOpenSignIn(false)}>
      
          <div style={modalStyle} className={classes.paper}>
            <form className='app_signin'>
              <center>
              <img className='app_headerImage'
                  alt = "instagram"
                  src="https://freelogopng.com/images/all_img/1658587597instagram-png-image.png"/>    
              </center>
              <Input 
                  placeholder='username'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}/>
              <Input 
                  placeholder='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}/>
              <Button
                  type="submit"
                  onClick={signIn}>Login</Button>
            </form>
          </div>
      
      </Modal>

      <div className='app_header'>
        <img className='app_headerImage'
              alt = "instagram"
              src="https://freelogopng.com/images/all_img/1658587597instagram-png-image.png"
            /> 

        { authToken ?
            (
              <Button onClick={signOut}>Logout</Button>
            ) :
            (
              <div>
                <Button onClick={() => setOpenSignIn(true)}>Login</Button>
                <Button onClick={() => setOpenSignUp(true)}>SignUp</Button>
              </div>
            )
        } 
        
        
      </div>
        <div className='app_posts'>
        {
          posts.map(post => (
            <Post
              post = {post}/>
          ))
        }
      </div>
    </div>
  );
}

export default App;
