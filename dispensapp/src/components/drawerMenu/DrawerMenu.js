import React, { useEffect, useState } from 'react';
import {
    Route,
    NavLink,
    HashRouter,
    Redirect
} from "react-router-dom";
import MenuBookIcon from '@material-ui/icons/MenuBook';
import KitchenIcon from '@material-ui/icons/Kitchen';
import HomeIcon from '@material-ui/icons/Home';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import { Divider, List, ListItem, ListItemIcon, ListItemText, ListItemAvatar, Avatar, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import packageJson from '../../../package.json';
import axios from 'axios';
import * as config from '../../config';

import './DrawerMenu.css';

import Home from '../home/Home';
import Storage from '../storage/Storage';
import Catalog from '../catalog/Catalog';
import SignUp from '../user/SignUp';
import LogIn from '../user/LogIn';

const useStyles = makeStyles((theme) => ({
    green: {
        color: '#fff',
        backgroundColor: green[500],
    },
}));

const DrawerMenu = (props) => {
    const apiVersionBaseUrl = config.apiVersionBaseUrl(process.env.REACT_APP_API_URL);
    axios.defaults.headers.common = { 'Authorization': `Bearer ${props.auth.token}` }

    const classes = useStyles();

    const [apiVersion, setApiVersion] = useState('');
    useEffect(() => {
        axios.get(apiVersionBaseUrl).then(
            (response) => {
                setApiVersion(response.data);
            }
        ).catch(
            (err) => {
                console.error(err);
            }
        );
    }, []);

    const list = () => (
        <div
            role="presentation"
            onClick={props.toggleDrawer(false)}
            onKeyDown={props.toggleDrawer(false)}
        >
            {props.auth && (
                <div>
                    <List>
                        <NavLink to="/" className='MenuItem'>
                            <ListItem button key='User'>
                                <ListItemAvatar>
                                    <Avatar alt={props.auth.username} className={classes.green}>{props.auth.username.match(/\b(\w)/g).join('')}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={props.auth.username} />
                            </ListItem>
                        </NavLink>
                    </List>
                    <Divider />
                </div>
            )}
            <List>
                <NavLink to="/" className='MenuItem'>
                    <ListItem button key='Home'>
                        <ListItemIcon><HomeIcon /></ListItemIcon>
                        <ListItemText primary='Home' />
                    </ListItem>
                </NavLink>
                <NavLink to="/storage" className='MenuItem'>
                    <ListItem button key='Dispensa'>
                        <ListItemIcon><KitchenIcon /></ListItemIcon>
                        <ListItemText primary='Dispensa' />
                    </ListItem>
                </NavLink>
            </List>
            <Divider />
            <List>
                <NavLink to="/catalog" className='MenuItem'>
                    <ListItem button key='Catalogo'>
                        <ListItemIcon><MenuBookIcon /></ListItemIcon>
                        <ListItemText primary='Catalogo' />
                    </ListItem>
                </NavLink>
            </List>
            <Divider />
            <Typography variant="body2" color="textSecondary" style={{ marginLeft: '1.5em', marginTop: '1em', fontStyle: 'oblique' }}>
                Ver: {packageJson.version}
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginLeft: '1.5em', marginTop: '1em', fontStyle: 'oblique' }}>
                API: {apiVersion.version}
            </Typography>
        </div>
    );


    return (
        <HashRouter>
            <div>
                <React.Fragment key={'left'}>
                    <SwipeableDrawer
                        anchor={'left'}
                        open={props.isDrawerOpen}
                        onClose={props.toggleDrawer(false)}
                        onOpen={props.toggleDrawer(true)}
                        disableSwipeToOpen>

                        {list()}
                    </SwipeableDrawer>
                </React.Fragment>
            </div>
            <div className="content">
                <Route
                    exact path='/'
                    render={(p) => (
                        props.auth ? (
                            <Home auth={props.auth} />
                        ) : (
                                <Redirect to={{ pathname: '/login', state: { from: p.location } }} />
                            )
                    )}
                />
                <Route
                    exact path='/catalog'
                    render={(p) => (
                        props.auth ? (
                            <Catalog auth={props.auth} />
                        ) : (
                                <Redirect to={{ pathname: '/login', state: { from: p.location } }} />
                            )
                    )}
                />
                <Route
                    path='/storage'
                    render={(p) => (
                        props.auth ? (
                            <Storage auth={props.auth} />
                        ) : (
                                <Redirect to={{ pathname: '/login', state: { from: p.location } }} />
                            )
                    )}
                />
                <Route
                    path='/signup'
                    render={() => (
                        <SignUp auth={props.auth} />
                    )}
                />
                <Route
                    path='/login'
                    render={(p) => (
                        !props.auth ? (
                            <LogIn auth={props.auth} setAuth={props.setAuth} />
                        ) : (
                                <Redirect to={{ pathname: '/', state: { from: p.location } }} />
                            )
                    )}
                />
            </div>
        </HashRouter>
    );
}

export default DrawerMenu;