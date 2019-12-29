import React, { useContext, useReducer, useEffect } from 'react';
import { useAsync } from 'react-use'
import './App.css';
import { ConfigProvider as AntdConfigProvider, Layout, Typography, Menu, Button } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'antd/dist/antd.css';
import { makeStyles } from '@material-ui/styles';
import { useMockableJsonFetch } from './hook'
import { ExplorePage, CategoryPage } from './page'
import * as Event from './event'
import Debugger from './Debugger'
import * as Config from './Config'

moment.locale('zh-cn');

useMockableJsonFetch.enableMock = Config.enableMock
const defaultPageKey = 'explore'

const pageMap = {
  explore: {
    name: '探索',
    component: ExplorePage
  },
  category: {
    name: '分类',
    component: CategoryPage,
  }
}

const AppContext = React.createContext();
const { location, history } = window

const useAppStyles = makeStyles({
  RootLayout: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  Header: {
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    '&>h1': {
      color: 'white',
      fontWeight: 'normal',
      fontSize: '1.2rem',
      marginBottom: '0',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      flexGrow: 1
    }
  }
})

function Header() {
  const { pageKey, title, user, dispatch } = useContext(AppContext)
  const pageList = ['explore']
  if (Config.enableCategoryModule) pageList.push('category')

  const styles = useAppStyles()
  const hasLogin = Boolean(user)

  return <Layout.Header className={styles.Header}>
    {title ?
      <Typography.Title level={1}>{title}</Typography.Title>
      : <div style={{ flexGrow: 1 }} />
    }
    <Menu
      style={{ lineHeight: '64px', marginRight: '2rem' }}
      theme="dark"
      mode="horizontal"
      selectedKeys={[`${pageKey}`]}
      onClick={({ key }) => {
        dispatch(new Event.PageEvent(key))
      }}
    >
      {
        pageList.map(key =>
          <Menu.Item key={key}>
            {pageMap[key].name}
          </Menu.Item>)
      }
    </Menu>
    {
      hasLogin
        ? <Button shape="round" icon="user">我</Button>
        : <Button ghost shape="round" icon="login">管理员</Button>
    }
  </Layout.Header>
}

const handlerMapper = {
  [Event.ConfigLoadedEvent]: (state, { data: { name } }) => {
    document.title = state.title = name
  },
  [Event.PageEvent]: (state, { key }) => {
    if (state.pageKey !== key)
      history.pushState({ pageKey: key }, `${state.title} - ${pageMap[key].name}`, key)
    state.pageKey = key
  },
  [Event.GoBackEvent]: (state, event) => {
    const { state: oldState } = history
    state.pageKey = oldState ? oldState.pageKey : defaultPageKey
  },
  [Event.AdminLoginEvent]: (state, event) => {
    state.user = {
      username: event.username
    }
  },
  [Event.AdminLogoutEvent]: (state, event) => {
    state.user = null
  }
}

function eventReducer(oldState, event) {
  const listener = handlerMapper[event.constructor]
  const newState = { ...oldState }
  listener(newState, event)
  return newState
}

function parsePageKey() {
  const keyInUrl = location.pathname.split('/')[1]
  return (keyInUrl in pageMap) ? keyInUrl : defaultPageKey
}

const defaultState = {
  title: null,
  pageKey: parsePageKey(),
  user: null
}

function ContentContainer({ currentPageKey, footer }) {
  return <div style={{
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <Layout.Content style={{ padding: '1rem 3rem', flexGrow: 1, minHeight: 'auto' }}>
      {Array.from(Object.keys(pageMap)).map(key => {
        const PageComponent = pageMap[key].component

        return (<div key={key} {...key !== currentPageKey && { style: { display: 'none' } }}>
          <PageComponent />
        </div>)
      })}
    </Layout.Content>
    {footer}
  </div>
}

function App() {
  const [state, dispatch] = useReducer(eventReducer, defaultState)

  //#region 加载配置文件
  useAsync(async () => {
    const response = await fetch('/config.json')
    dispatch(new Event.ConfigLoadedEvent(
      await response.json()
    ))
  }, [])
  //#endregion 加载配置文件

  const styles = useAppStyles()
  const { pageKey } = state

  useEffect(() => {
    window.addEventListener('popstate', () => {
      dispatch(new Event.GoBackEvent())
    })
  }, [])

  return <AntdConfigProvider locale={zhCN}>
    <AppContext.Provider value={{ ...state, dispatch }}>
      <Layout className={styles.RootLayout}>
        <Header />
        <ContentContainer
          currentPageKey={pageKey}
          footer={<Layout.Footer>
            某某大学版权所有
            </Layout.Footer>} />
      </Layout>
      {Config.showDebugger && <Debugger />}
    </AppContext.Provider>
  </AntdConfigProvider >
}


App.Context = AppContext
export default App;