import { Component } from 'react';
import Link from 'next/link';
import { Base, Tabs, Tab, Divider } from '@bitrise/bitkit';
import startCase from 'lodash/startCase';

import { PageContext } from '@/models';
import { AppSettingsPageQuery, AppSettingsPageTabs } from '@/models/settings';
import { fetchSettings } from '@/ducks/settings';

import General from './general';
import Notifications from './notifications';

interface SettingsPageProps extends AppSettingsPageQuery {
  pagePath: string;
}

export class SettingsPage extends Component<SettingsPageProps> {
  static defaultProps = {
    selectedTab: 'general'
  };

  static async getInitialProps({ query, store, req, isServer }: PageContext) {
    const { appSlug, selectedTab = AppSettingsPageTabs[0] } = (query as unknown) as AppSettingsPageQuery;

    switch (selectedTab) {
      case 'general':
        await store.dispatch(fetchSettings(appSlug) as any);
        break;
    }

    const path = isServer ? req.path : location.pathname;
    const pagePath = path.replace(new RegExp(`/(${AppSettingsPageTabs.join('|')})?$`), '');

    return { appSlug, selectedTab, pagePath };
  }

  tabContent = () => {
    const { selectedTab, appSlug } = this.props;

    switch (selectedTab) {
      case 'general':
        return <General />;
      case 'notifications':
        return <Notifications appSlug={appSlug} />;
      default:
        return <h1>{selectedTab}</h1>;
    }
  };

  render() {
    const { pagePath, appSlug, selectedTab } = this.props;

    const tab = (key: string) => (
      <Tab active={selectedTab === key}>
        <Link as={`${pagePath}/${key}`} href={`/settings?appSlug=${appSlug}&selectedTab=${key}`}>
          <a>{startCase(key)}</a>
        </Link>
      </Tab>
    );

    return (
      <Base paddingVertical="x10">
        <Base maxWidth={960}>
          <Tabs gap="x10">
            {tab('general')}
            {tab('notifications')}
          </Tabs>
        </Base>
        <Divider color="gray-2" direction="horizontal" />
        <Base maxWidth={960}>{this.tabContent()}</Base>
      </Base>
    );
  }
}

export default SettingsPage;
