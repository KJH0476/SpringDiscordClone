import React, {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import SignUp from './SignUp';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import {loginSuccess} from "../reducers/reducer/userSlice";
import {addFriends} from "../reducers/reducer/friendSlice";
import {sendRequestWithToken} from "../common/requestWithToken";
import {addChatRoom} from "../reducers/reducer/chatRoomSlice";

const defaultTheme = createTheme();

export default function SignIn({ onLoginSuccess }) {
    const dispatch = useDispatch();
    const [errorMessage, setErrorMessage] = useState("");
    const [openSignUp, setOpenSignUp] = useState(false);

    //회원가입 창 열기
    const handleClickOpenSignUp = () => {
        setOpenSignUp(true);
    };

    //회원가입 창 닫기
    const handleCloseSignUp = () => {
        setOpenSignUp(false);
    };

    //로그인 폼 제출
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const loginDetails = {
            email: data.get('email'),
            password: data.get('password'),
        };
        try {
            const response = await fetch( process.env.REACT_APP_SERVER_URL + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginDetails),
            });
            //각 응답 상태마다 처리
            //400,401,403 -> 예외처리
            if (response.ok) {
                const jsonResponse = await response.json();
                // 서버 응답 처리, 토큰 저장
                window.localStorage.setItem('token', jsonResponse.token);
                // 로그인 성공 처리
                console.log("로그인 성공");
                const userInfo = await fetchUserInfo(jsonResponse.token, loginDetails.email);

                await loadFriendsData(userInfo.id);

                await loadChatRoom(userInfo.id);

                dispatch(loginSuccess(userInfo));

            } else if (response.status===400) {
                const errorData = await response.json(); // 서버로부터 에러 메시지 받기
                setErrorMessage(errorData.message);
                console.error('이메일 or 비밀번호 입력 X');
            } else if (response.status===401) {
                const errorData = await response.text()
                setErrorMessage(errorData);
                console.error("이메일, 비밀번호 틀린경우 or 토큰값 유효X");
            } else if (response.status===403) {
                console.error("권한이 없음");
            } else {
                console.error("서버 에러");
            }
        } catch (error) {
            // 네트워크 에러 또는 요청 관련 에러 처리
            console.error('로그인 요청 중 에러 발생:', error);
        }
    };

    async function fetchUserInfo(token, email) {
        const response = await fetch(process.env.REACT_APP_SERVER_URL + `/main/${email}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Main request failed: ' + response.statusText);
        }
    }

    const loadFriendsData = async (memberId) => {
        try {
            const [friendsResponse, friendsReceiveResponse] = await Promise.all([
                sendRequestWithToken(`/find-all-friend/${memberId}/FRIENDS`, null, 'GET', dispatch),
                sendRequestWithToken(`/find-all-friend/${memberId}/RECEIVED`, null, 'GET', dispatch)
            ]);

            if (friendsResponse.status === 200 && friendsResponse.data) {
                dispatch(addFriends(friendsResponse.data));
            }

            if (friendsReceiveResponse.status === 200 && friendsReceiveResponse.data) {
                dispatch(addFriends(friendsReceiveResponse.data));
            }
            console.log("친구 정보 로드 완료");
        }
        catch (error) {
            console.error(error);
        }
    };

    const loadChatRoom = async (memberId) => {
        try {
            const { status, data } = await sendRequestWithToken(`/find-chatRoom/${memberId}`, null, 'GET', dispatch);
            if (status === 200 && data) {
                console.log("채팅방 정보 로드 완료");
                dispatch(addChatRoom(data));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 15,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'black' }}>
                        <LockOpenRoundedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        LOGIN
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>} {}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                backgroundColor: 'black',
                                '&:hover': {
                                    backgroundColor: 'darkgray',
                                },
                            }}
                        >
                            LOGIN
                        </Button>
                        <Grid container>
                            <Grid item>
                                Don't have an account?
                                <Button
                                    onClick={handleClickOpenSignUp}
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'black',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    {"SignUp"}
                                </Button>

                            </Grid>
                        </Grid>
                        <Dialog open={openSignUp} onClose={handleCloseSignUp}>
                            <SignUp onClose={handleCloseSignUp} />
                        </Dialog>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
