import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import { yearOptions, monthOptions, dayOptions } from '../options/signUpOptions';
import {useState} from "react";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();

export default function SignUp({ onClose }) {
    const [fieldErrors, setFieldErrors] = useState({});
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [formFields, setFormFields] = useState({
        email: '',
        username: '',
    });
    const [fieldAvailable, setFieldAvailable] = useState({
        email: null,
        username: null,
    });

    // 각 Select 컴포넌트의 handleChange 함수 정의 -> birth select 박스 year, month, day
    const handleYearChange = (event) => {setYear(event.target.value);};
    const handleMonthChange = (event) => {setMonth(event.target.value);};
    const handleDayChange = (event) => {setDay(event.target.value);};

    //회원가입 성공 다이얼로그 닫기
    const handleSuccessDialogClose = (event) => {
        event.preventDefault();
        setOpenSuccessDialog(false);
        onClose();
    };

    //이메일, 사용자명 중복되는 값이 db에 있는지 확인
    const checkFieldAvailability = async (field, value) => {
        if (value.length > 0) {
            try {
                const response = await fetch(process.env.REACT_APP_SERVER_URL+`/signup/check?check=${value}`);
                const data = await response.json();
                if (response.status === 200) {
                    setFieldErrors(prevErrors => ({ ...prevErrors, [field]: data.message }));
                    setFieldAvailable(prevAvailable => ({ ...prevAvailable, [field]: true }));
                } else if (response.status === 409) {
                    setFieldErrors(prevErrors => ({ ...prevErrors, [field]: data.message }));
                    setFieldAvailable(prevAvailable => ({ ...prevAvailable, [field]: false }));
                }
            } catch (error) {
                console.error(`${field} check failed:`, error);
            }
        } else {
            setFieldErrors(prevErrors => ({ ...prevErrors, [field]: '' }));
        }
    };

    //이메일, 사용자명 필드가 바뀔때마다 checkFieldAvailability 메소드 호출하여 중복 검사
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormFields(prevFields => ({ ...prevFields, [name]: value }));
        checkFieldAvailability(name, value);
    };

    //회원가입 폼 제출
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const signUpDetails = {
            email: data.get('email'),
            nickname: data.get('nickname'),
            username: data.get('username'),
            password: data.get('password'),
            birth: data.get('year') + "-" + data.get('month') + "-" + data.get('day')
        };

        try {
            const response = await fetch( process.env.REACT_APP_SERVER_URL + '/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signUpDetails),
            });
            //각 상태별 처리
            //400 예외처리
            if(response.ok){
                setOpenSuccessDialog(true);
            }
            else if(response.status===400){
                const errorData = await response.json();
                // 에러 메시지 객체를 상태에 저장
                setFieldErrors(errorData);
                const newFieldAvailability = {...fieldAvailable};
                if (errorData.email) newFieldAvailability.email = false;
                if (errorData.username) newFieldAvailability.username = false;
                setFieldAvailable(newFieldAvailability);
            }
        } catch (error) {
            // 네트워크 에러 또는 요청 관련 에러 처리
            console.error('로그인 요청 중 에러 발생:', error);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{m: 1, bgcolor: 'black'}}>
                        <CheckBoxIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt: 3}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={formFields.email}
                                    onChange={handleInputChange}
                                    error={fieldAvailable.email === false}
                                    helperText={fieldErrors.email}
                                    FormHelperTextProps={{ style: { color: fieldAvailable.email ? 'green' : 'red' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                            <TextField
                                    fullWidth
                                    name="nickname"
                                    label="Nickname"
                                    type="nickname"
                                    id="nickname"
                                    autoComplete="nickname"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="username"
                                    label="Username"
                                    type="username"
                                    id="username"
                                    autoComplete="username"
                                    value={formFields.username}
                                    onChange={handleInputChange}
                                    error={fieldAvailable.username === false}
                                    helperText={fieldErrors.username}
                                    FormHelperTextProps={{ style: { color: fieldAvailable.username ? 'green' : 'red' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                            <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    error={!!fieldErrors.password}
                                    helperText={fieldErrors.password}
                                />
                            </Grid>
                            <Grid item xs={4}>
                            <FormControl sx={{ m: 1, minWidth: 100 }}>
                                    <InputLabel id="year-select-label">Year</InputLabel>
                                    <Select
                                        labelId="year-select-label"
                                        name="year"
                                        id="year-select"
                                        value={year}
                                        onChange={handleYearChange}
                                        label="Year"
                                    >
                                        {yearOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl sx={{ m: 1, minWidth: 100 }}>
                                    <InputLabel id="month-select-label">Month</InputLabel>
                                    <Select
                                        labelId="month-select-label"
                                        name="month"
                                        id="month-select"
                                        value={month}
                                        onChange={handleMonthChange}
                                        label="Month"
                                    >
                                        {monthOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl sx={{ m: 1, minWidth: 100 }}>
                                    <InputLabel id="day-select-label">Day</InputLabel>
                                    <Select
                                        labelId="day-select-label"
                                        name="day"
                                        id="day-select"
                                        value={day}
                                        onChange={handleDayChange}
                                        label="Day"
                                    >
                                        {dayOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {fieldErrors.birth && <div style={{color: 'red'}}>{fieldErrors.birth}</div>}
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2,
                                backgroundColor: 'black',
                                '&:hover': {
                                    backgroundColor: 'darkgray',
                                },}}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Button
                                    onClick={onClose}
                                    sx={{color:'black'}}
                                >
                                    Already have an account? Sign in
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{mt: 5}}/>
            </Container>
            <Dialog
                open={openSuccessDialog}
                onClose={handleSuccessDialogClose}
            >
                <DialogTitle>{"회원가입 성공!"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        회원가입이 성공적으로 완료되었습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={(event) => handleSuccessDialogClose(event)} type="button">확인</Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}