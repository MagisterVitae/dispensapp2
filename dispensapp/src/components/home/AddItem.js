import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles({
    box: {
        height: "30vh",
    },
    card: {
        backgroundColor: '#76ff03',
        textAlign: "center",
    },
    cardContent: {
        alignItems: "center",
    },
    icon: {
        color: "white",
        fontSize: "20vmax",
        textAlign: "center"
    }
});

const AddItem = (props) => {
    const classes = useStyles();

    return (
        <Card onClick={() => props.onClick()} className={classes.card}>
            <CardActionArea>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={1}
                    m={1}
                    className={classes.box}>
                    <CardContent className={classes.cardContent}>
                        <AddIcon className={classes.icon} />
                    </CardContent>
                </Box>
            </CardActionArea>
        </Card>
    );
}

export default AddItem;