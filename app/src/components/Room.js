import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as appPropTypes from './appPropTypes';
import { withStyles } from '@material-ui/core/styles';
import isElectron from 'is-electron';
import * as roomActions from '../actions/roomActions';
import * as toolareaActions from '../actions/toolareaActions';
import { idle } from '../utils';
import FullScreen from './FullScreen';
import { FormattedMessage } from 'react-intl';
import CookieConsent from 'react-cookie-consent';
import CssBaseline from '@material-ui/core/CssBaseline';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
// import Hidden from '@material-ui/core/Hidden';
import Notifications from './Notifications/Notifications';
import MeetingDrawer from './MeetingDrawer/MeetingDrawer';
import Democratic from './MeetingViews/Democratic';
import Filmstrip from './MeetingViews/Filmstrip';
import AudioPeers from './PeerAudio/AudioPeers';
import FullScreenView from './VideoContainers/FullScreenView';
import VideoWindow from './VideoWindow/VideoWindow';
import LockDialog from './AccessControl/LockDialog/LockDialog';
import Settings from './Settings/Settings';
import TopBar from './Controls/TopBar';
import WakeLock from 'react-wakelock-react16';

const TIMEOUT = 5 * 1000;

const styles = (theme) =>
	({
		root :
		{
			display              : 'grid',
			gridTemplateColumns  : 'max-content',
			gridTemplateRows     : 'max-content',
			gridTemplateAreas    : '"header header" "one two"',
			width                : '100vw',
			height               : '100vh',
			backgroundColor      : 'var(--background-color)',
			backgroundImage      : `url(${window.config ? window.config.background : null})`,
			backgroundAttachment : 'fixed',
			backgroundPosition   : 'center',
			backgroundSize       : 'cover',
			backgroundRepeat     : 'no-repeat'
		},
		drawerPaper :
		{
			width                          : '30vw',
			[theme.breakpoints.down('lg')] :
			{
				width : '30vw'
			},
			[theme.breakpoints.down('md')] :
			{
				width : '40vw'
			},
			[theme.breakpoints.down('sm')] :
			{
				width : '40vw'
			},
			[theme.breakpoints.down('xs')] :
			{
				width : '40vw'
			},

			position : 'static',
			gridArea : 'one'
			// transition: 'width 450ms cubic-bezier(0.23, 1, 0.32, 1)',
		},

		drawerPaperClosed :
		{
			width 			: '0vw',
			position	: 'static',
			gridArea	: 'one'
			// transition: 'width 450ms cubic-bezier(0.23, 1, 0.32, 1)',
		}
	});

class Room extends React.PureComponent
{
	constructor(props)
	{
		super(props);

		this.fullscreen = new FullScreen(document);

		this.state =
		{
			fullscreen : false
		};
	}

	waitForHide = idle(() =>
	{
		this.props.setToolbarsVisible(false);
	}, TIMEOUT);

	handleMovement = () =>
	{
		// If the toolbars were hidden, show them again when
		// the user moves their cursor.
		if (!this.props.room.toolbarsVisible)
		{
			this.props.setToolbarsVisible(true);
		}

		this.waitForHide();
	}

	componentDidMount()
	{
		if (this.fullscreen.fullscreenEnabled)
		{
			this.fullscreen.addEventListener('fullscreenchange', this.handleFullscreenChange);
		}

		window.addEventListener('mousemove', this.handleMovement);
		window.addEventListener('touchstart', this.handleMovement);
	}

	componentWillUnmount()
	{
		if (this.fullscreen.fullscreenEnabled)
		{
			this.fullscreen.removeEventListener('fullscreenchange', this.handleFullscreenChange);
		}

		window.removeEventListener('mousemove', this.handleMovement);
		window.removeEventListener('touchstart', this.handleMovement);
	}

	handleToggleFullscreen = () =>
	{
		if (this.fullscreen.fullscreenElement)
		{
			this.fullscreen.exitFullscreen();
		}
		else
		{
			this.fullscreen.requestFullscreen(document.documentElement);
		}
	};

	handleFullscreenChange = () =>
	{
		this.setState({
			fullscreen : this.fullscreen.fullscreenElement !== null
		});
	};

	render()
	{
		const {
			room,
			browser,
			advancedMode,
			toolAreaOpen,
			toolAreaPinned,
			toggleToolArea,
			classes,
			theme
		} = this.props;

		const View =
		{
			filmstrip  : Filmstrip,
			democratic : Democratic
		}[room.mode];
		
		return (
			<div className={classes.root}>
				{ !isElectron() &&
					<CookieConsent
						buttonText={
							<FormattedMessage
								id='room.consentUnderstand'
								defaultMessage='I understand'
							/>
						}
					>
						<FormattedMessage
							id='room.cookieConsent'
							defaultMessage='This website uses cookies to enhance the user experience'
						/>
					</CookieConsent>
				}

				<FullScreenView advancedMode={advancedMode} />

				<VideoWindow advancedMode={advancedMode} />

				<AudioPeers />

				<Notifications />

				<CssBaseline />

				<TopBar
					fullscreenEnabled={this.fullscreen.fullscreenEnabled}
					fullscreen={this.state.fullscreen}
					onFullscreen={this.handleToggleFullscreen}
				/>

				{/* <nav> */}
				{/* <Hidden implementation='css'>*/}

				<SwipeableDrawer
					variant='persistent'
					anchor={theme.direction === 'rtl' ? 'right' : 'left'}
					BackdropProps={{ invisible: true }}
					open={toolAreaOpen}
					onOpen={toggleToolArea}
					onBackdropClick={!toolAreaPinned ? null : toggleToolArea}
					onClose={toggleToolArea}
					classes={{
						paper : toolAreaOpen ? classes.drawerPaper : classes.drawerPaperClosed
					}}
				>
					<MeetingDrawer closeDrawer={toggleToolArea} />
				</SwipeableDrawer>
				{/* </Hidden> */}
				{/* </nav> */}

				{ browser.platform === 'mobile' && browser.os !== 'ios' &&
					<WakeLock />
				}

				<div onClick={!toolAreaPinned && toolAreaOpen ? toggleToolArea : null}>
					<View 
						advancedMode={advancedMode}
					/>
				</div>

				{ room.lockDialogOpen &&
					<LockDialog />
				}

				{ room.settingsOpen &&
					<Settings />
				}
			</div>
		);
	}
}

Room.propTypes =
{
	room               : appPropTypes.Room.isRequired,
	browser            : PropTypes.object.isRequired,
	advancedMode       : PropTypes.bool.isRequired,
	toolAreaOpen       : PropTypes.bool.isRequired,
	toolAreaPinned     : PropTypes.bool.isRequired,
	setToolbarsVisible : PropTypes.func.isRequired,
	toggleToolArea     : PropTypes.func.isRequired,
	classes            : PropTypes.object.isRequired,
	theme              : PropTypes.object.isRequired
};

const mapStateToProps = (state) =>
	({
		room           : state.room,
		browser        : state.me.browser,
		advancedMode   : state.settings.advancedMode,
		toolAreaOpen   : state.toolarea.toolAreaOpen,
		toolAreaPinned : state.toolarea.toolAreaPinned
	});

const mapDispatchToProps = (dispatch) =>
	({
		setToolbarsVisible : (visible) =>
		{
			dispatch(roomActions.setToolbarsVisible(visible));
		},
		toggleToolArea : () =>
		{
			dispatch(toolareaActions.toggleToolArea());
		}

	});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				prev.room === next.room &&
				prev.me.browser === next.me.browser &&
				prev.settings.advancedMode === next.settings.advancedMode &&
				prev.toolarea.toolAreaOpen === next.toolarea.toolAreaOpen &&
				prev.toolarea.toolAreaPinned === next.toolarea.toolAreaPinned
			);
		}
	}
)(withStyles(styles, { withTheme: true })(Room));