import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import * as toolareaActions from '../../actions/toolareaActions';
// import { useIntl } from 'react-intl';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@material-ui/core/Badge';
import Chat from './Chat/Chat';
import FileSharing from './FileSharing/FileSharing';
import ParticipantList from './ParticipantList/ParticipantList';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import ChatIcon from '@material-ui/icons/Chat';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import PeopleIcon from '@material-ui/icons/People';

const tabs =
[
	'chat',
	'files',
	'users'
];

const styles = (theme) =>
	({
		root :
		{
			display         : 'flex',
			flexDirection   : 'column',
			width           : '100%',
			height          : '100%',
			backgroundColor : theme.palette.background.paper
		},
		appBar :
		{
			display       : 'flex',
			flexDirection : 'row',
			position      : 'static'
		},
		tabsHeader :
		{
			// flexGrow : 1,
			flexBasis : '100%'
		},

		tab : {
			minWidth : '50px',
			maxWidth : '50px'
		} 

	});

const MeetingDrawer = (props) =>
{
	// const intl = useIntl();

	const {
		currentToolTab,
		pinToolArea,
		toolAreaPinned,
		unreadMessages,
		unreadFiles,
		closeDrawer,
		setToolTab,
		classes,
		theme
	} = props;

	return (
		<div className={classes.root}>
			<AppBar
				position='static'
				color='default'
				className={classes.appBar}
			>
				<Tabs
					className={classes.tabsHeader}
					value={tabs.indexOf(currentToolTab)}
					onChange={(event, value) => setToolTab(tabs[value])}
					indicatorColor='primary'
					textColor='primary'
					variant='fullWidth'
				>
					<Tab
						label={
							<Badge color='secondary' badgeContent={unreadMessages}>
								<ChatIcon/>&nbsp;
								{/*
								{intl.formatMessage({
									id						 : 'label.chat',
									defaultMessage : 'Chat'
								})}
								*/}
							</Badge>
						} className={classes.tab}
					/>
					<Tab
						label={
							<Badge color='secondary' badgeContent={unreadFiles}>
								<AttachFileIcon/>&nbsp;
								{/*
								{intl.formatMessage({
									id						 : 'label.filesharing',
									defaultMessage : 'File sharing'
								})}
								*/}
							</Badge>
						} className={classes.tab} 
					/>
					<Tab
						label={
							<Badge color='secondary'>
								<PeopleIcon/>&nbsp;
								{/*
							{intl.formatMessage({
								id						 : 'label.participants',
								defaultMessage : 'Participants'
							})}
							*/}
							</Badge>
						} className={classes.tab}
					/>
				</Tabs>
				<IconButton onClick={pinToolArea}>
					{toolAreaPinned === true ?
						<VpnKeyIcon style={{ fill: 'red' }}/> : 
						<VpnKeyIcon style={{ fill: 'gray' }}/>
					}
				</IconButton>
				<IconButton onClick={closeDrawer}> 
					{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
				</IconButton>

			</AppBar>
			{currentToolTab === 'chat' && <Chat />}
			{currentToolTab === 'files' && <FileSharing />}
			{currentToolTab === 'users' && <ParticipantList />}
		</div>
	);
};

MeetingDrawer.propTypes =
{
	currentToolTab : PropTypes.string.isRequired,
	setToolTab     : PropTypes.func.isRequired,
	unreadMessages : PropTypes.number.isRequired,
	unreadFiles    : PropTypes.number.isRequired,
	closeDrawer    : PropTypes.func.isRequired,
	classes        : PropTypes.object.isRequired,
	theme          : PropTypes.object.isRequired,
	toolAreaPinned : PropTypes.bool.isRequired,
	pinToolArea    : PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
	currentToolTab : state.toolarea.currentToolTab,
	unreadMessages : state.toolarea.unreadMessages,
	unreadFiles    : state.toolarea.unreadFiles,
	toolAreaPinned : state.toolarea.toolAreaPinned
});

const mapDispatchToProps = {
	setToolTab  : toolareaActions.setToolTab,
	pinToolArea : toolareaActions.pinToolArea
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				prev.toolarea.currentToolTab === next.toolarea.currentToolTab &&
				prev.toolarea.unreadMessages === next.toolarea.unreadMessages &&
				prev.toolarea.unreadFiles === next.toolarea.unreadFiles &&
				prev.toolarea.toolAreaPinned === next.toolarea.toolAreaPinned
			);
		}
	}
)(withStyles(styles, { withTheme: true })(MeetingDrawer));
