import React from 'react';
import {Link, useHistory, useParams} from 'react-router-dom';

import Layout from './widgets/layout';
import ChannelCard from './widgets/channelCard';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {channels, useStyles} from "themeLocus";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import FormControl from '@material-ui/core/FormControl';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputLabel from '@material-ui/core/InputLabel';
import Chip from '@material-ui/core/Chip';

import LinearProgress from '@material-ui/core/LinearProgress';
import {useCookies} from "react-cookie";

import Distance from "libs/Distance";

import SearchDistance from "./search/SearchDistance";
import SearchRange from "./search/SearchRange";
import SearchTags from "./search/SearchTags";

const Category = () => {
	const history = useHistory();

	const classes = useStyles();
	const distance = new Distance();

	let {category, searchLocation, searchDistance} = useParams();

	const [currentCategory, setCurrentCategory] = React.useState(category);


	const [report, setReport] = React.useState(null);
	const [tags, setTags] = React.useState([]);
	const [location, setLocation] = useCookies(['location']);

	let channel = channels.getChannelProperties(category);


	React.useEffect(() => {

		window.websocket.registerQueue("categoryLoader", function (json) {
			setReport(json);
		});

		if (report === null) {
			forceUpdate();
		}

		return () => {
			window.websocket.clearQueues();
		}


	}, [report]);

	function handleLocationChange() {
		setReport(null);

	}

	function handleChange(e) {
		setLocation('distanceSelect', e.target.value, {path: '/', sameSite: true});
	}

	function handleFilterChange(e, newValue) {
		const distance = newValue;
		setLocation('distance', distance, {path: '/', sameSite: true});
		location.distance = distance;
		setReport(null);
	}

	function handleTagChange(newTags) {
		setTags(newTags);
		setReport(null);
	}

	function handleRangeChange(e, newValue) {

		setLocation('rangeFrom', newValue[0], {path: '/', sameSite: true});
		setLocation('rangeTo', newValue[1], {path: '/', sameSite: true});

		setReport(null);
	}

	const forceUpdate = () => {
		let actualDistance = distance.distanceActual(location.distance, location.distanceSelect);
		let actualLocation = location.location;
		if (searchLocation !== undefined) {
			actualLocation = searchLocation.split(",");
			actualDistance = searchDistance || 1;
		}
		let packet = {
			"queue": "categoryLoader",
			"api": "api",
			"data": {
				"method": "search",
				"category": channel.category,
				"limit": 100,
				"location": `SRID=4326;POINT(${actualLocation[0]} ${actualLocation[1]})`
			}
		};
		if (channel.search === undefined || channels.getChannelSearchItem(category, 'SearchDistance') !== false) {
			packet.data.location_distance = actualDistance;
		}

		if (channel.filterTags)
			packet.data.tags = channel.filterTags;
		// Tags filter override?
		if (tags.length > 0 && channel.search !== undefined && channels.getChannelSearchItem(category, 'SearchTags') !== false)
			packet.data.tags = tags;
		if (location.rangeFrom && channel.search !== undefined && channels.getChannelSearchItem(category, 'SearchRange') !== false) {
			packet.data.min_range = location.rangeFrom;
			packet.data.max_range = location.rangeTo;
		}
		window.websocket.send(packet);
	}

	if (currentCategory !== category) {
		setCurrentCategory(category);
		forceUpdate();
	}

	const showHeader = (feature) => {
		if (feature.properties.tags && feature.properties.tags.length > 0) {
			return (<CardHeader
				avatar={
					<Avatar aria-label={feature.properties.tags[0]}
					        style={{"backgroundColor": `${channels.getChannelColor(category, feature.properties.tags[0])}`}}>
						{feature.properties.tags[0][0].toUpperCase()}
					</Avatar>
				}
				title={feature.properties.description.title}
				subheader={'Distance: ' + distance.distanceFormatNice(feature.properties.distance, location.distanceSelect)}
			>
			</CardHeader>)
		}
		return <CardHeader/>;
	}

	const showReport = () => {

		if (report.packet.features.length > 0) {
			return (report.packet.features
					.map(feature => (
						<Card component="div" variant="outlined" className={classes.categoryResultsCard}
						      key={feature.properties.fid}>
							{showHeader(feature)}
							<CardActionArea key={'caa-' + feature.properties.fid}>
								<CardContent key={'cc-' + feature.properties.fid}>
									{feature.properties.tags.map(tag => (
										<Chip component="div" label={tag} variant="outlined"
										      key={`chip-${tag}-${feature.properties.fid}`}
										      style={{"backgroundColor": `${channels.getChannelColor(category, tag)}`}}
										      className={classes.tags}/>
									))}
									<Typography gutterBottom variant="h5" component="h2">
										{feature.properties.description.title}
									</Typography>
									<Typography variant="body2" color="textSecondary" component="p">
										{feature.properties.description.text}
									</Typography>
								</CardContent>
							</CardActionArea>
							<CardActions>
								<Button size="small" color="secondary" variant="outlined"
								        onClick={() => {
									        history.push(`/View/${category}/${feature.properties.fid}`)
								        }}>
									View
								</Button>
							</CardActions>
						</Card>
					))
			)
		} else {
			return (
				<Card className={classes.channelCardForm}>
					<CardContent>
						<Typography variant="h4" component="h4" gutterBottom>
							No results found
						</Typography>
						<Typography variant="body2" color="textSecondary" component="p">Try adjusting the distance
							filters as your are currently limiting your results
							to {location.distance} {distance.distanceLang(location.distanceSelect)}</Typography>
					</CardContent>
				</Card>
			)
		}
	}

	const showSearch = () => {
		if (channel.search === undefined) {
			return (
				<SearchDistance changeFunction={handleFilterChange}
				                currentValue={location.distance} min={1} max={1000}/>
			)
		} else {
			return (
				channel.search.map(function (item, index) {
					if (item.component === 'SearchDistance') {
						return (<SearchDistance key={index} changeFunction={handleFilterChange} min={item.min}
						                        max={item.max}
						                        currentValue={location.distance}/>)
					}
					if (item.component === 'SearchRange') {
						return (
							<SearchRange key={index} changeFunction={handleRangeChange} title={item.title}
							             min={item.min}
							             max={item.max}
							             currentValueFrom={location.rangeFrom || item.min}
							             currentValueTo={location.rangeTo || item.max}/>)
					}
					if (item.component === 'SearchTags') {
						return (<SearchTags key={index} category={category} changeFunction={handleTagChange}
						                    currentValue={tags}/>)
					}
				})
			)
		}

	}

	if (report !== null) {
		return (
			<Layout update={handleLocationChange}>
				<Grid container className={classes.root} spacing={6}>
					<Grid item md={4} className={classes.gridFull} key={"category"}>
						<Paper elevation={3} className={classes.paperMargin}>
							<ChannelCard path={'/'}/>

							<Card className={classes.channelCardForm}>
								<CardContent>
									{showSearch()}
								</CardContent>
							</Card>
						</Paper>
					</Grid>
					<Grid item md={8}>
						<Paper elevation={3} className={classes.paperMargin}>

							{showReport()}

						</Paper>
					</Grid>
				</Grid>
			</Layout>
		);
	} else {
		return (
			<Layout>
				<LinearProgress/>
			</Layout>
		)
	}

};

export default Category;