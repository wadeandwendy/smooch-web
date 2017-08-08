import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { ChannelPage } from './channel-page';
import { getAppChannelDetails } from '../../utils/app';

export class ChannelComponent extends Component {
    static propTypes = {
        appChannels: PropTypes.array.isRequired,
        channelStates: PropTypes.object.isRequired,
        visibleChannelType: PropTypes.string,
        sparkcentralId: PropTypes.string,
        clients: PropTypes.array
    };

    render() {
        const {appChannels, visibleChannelType, sparkcentralId, clients, pendingClients, channelStates} = this.props;

        if (!sparkcentralId) {
            return null;
        }

        const channelPages = getAppChannelDetails(appChannels).map(({channel, details}) => {
            const client = clients.find((client) => client.platform === channel.type);
            const pendingClient = pendingClients.find((client) => client.platform === channel.type);

            if (!details.Component || (!!client && !details.renderPageIfLinked)) {
                return null;
            }

            return <ChannelPage key={ channel.type }
                                {...details}
                                channel={ channel }
                                icon={ details.iconLarge }
                                icon2x={ details.iconLarge2x }
                                client={ client }
                                pendingClient={ pendingClient }
                                visible={ channel.type === visibleChannelType }>
                       <details.Component {...channel}
                                          channelState={ channelStates[channel.type] }
                                          getContent={ details.getContent }
                                          sparkcentralId={ sparkcentralId }
                                          linked={ !!client } />
                   </ChannelPage>;
        });

        return <div className='channel-pages-container'>
                   { channelPages }
               </div>;
    }
}

export const Channel = connect(({appState, app, user, integrations}) => {
    return {
        visibleChannelType: appState.visibleChannelType,
        appChannels: app.integrations,
        channelStates: integrations,
        sparkcentralId: user._id,
        clients: user.clients,
        pendingClients: user.pendingClients
    };
})(ChannelComponent);
