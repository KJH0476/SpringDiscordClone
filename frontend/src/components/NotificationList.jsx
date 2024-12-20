import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from "react-redux";
import { removeNotification } from "../reducers/reducer/notificationSlice";
import { useDispatch } from "react-redux";

const Demo = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));

export default function NotificationList() {
    const [dense, setDense] = React.useState(false);
    const notifications = useSelector(state => state.notification.notifications);
    const dispatch = useDispatch();

    console.log(notifications);

    const handleRemoveNotification = (notificationId) => {
        dispatch(removeNotification(notificationId));
    };

    return (
        <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
            <Grid item xs={12} md={6}>
                <Demo>
                    <Typography variant="h6" component="div">
                        받은알림함
                    </Typography>
                    <Divider />
                    <List dense={dense}>
                        {notifications.map((notification, index) => (
                            <ListItem
                                key={index}
                                secondaryAction={
                                    <IconButton
                                        onClick={() => handleRemoveNotification(notification.id)}
                                        edge="end" aria-label="delete">
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar>
                                        <FolderIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={notification.message}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Demo>
            </Grid>
        </Box>
    );
}