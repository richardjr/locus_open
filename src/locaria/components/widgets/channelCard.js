import React from 'react';

import {Link, useHistory, useParams} from "react-router-dom";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import {channels, useStyles} from "themeLocus";
import Share from "./share";


const ChannelCard = ({path}) => {
	const history = useHistory();

	const classes = useStyles();
	let {category} = useParams();
	let channel = channels.getChannelProperties(category);

	const historyBack = () => {
		history.goBack();
	}

	const submitFeature = () => {
		history.push(`/Submit/${category}`);

	}

	return (
		<Card className={classes.root}>
			<CardMedia
				className={classes.media}
				image={channel.image}
				title={channel.name}
			/>
			<CardContent>
				<Typography gutterBottom variant="h5" component="h2">
					{channel.name}
				</Typography>
				<Typography variant="body2" color="textSecondary" component="p">
					{channel.description}
				</Typography>
			</CardContent>
			<CardActions>
				<Share></Share>
				<Button size="small" color="secondary" onClick={historyBack} variant="outlined">
					Back
				</Button>
				{channel.submit ?
					<Button size="small" color="secondary" onClick={submitFeature} variant="outlined">
						Submit
					</Button> : ''}

			</CardActions>
		</Card>
	)

};


export default ChannelCard;