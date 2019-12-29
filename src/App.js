import React, { useContext, useReducer, useEffect, useState } from 'react';
import { useAsync } from 'react-use'
import './App.css';
import { ConfigProvider as AntdConfigProvider, Layout, Typography, Menu, Button, Input } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'antd/dist/antd.css';
import { makeStyles } from '@material-ui/styles';
import { useMockableJsonFetch } from './hook'
import { PageKeys, PageMap } from './page'
import * as Event from './event'
import Debugger from './Debugger'
import * as Config from './Config'

//#region 初始化配置
moment.locale('zh-cn');
useMockableJsonFetch.enableMock = Config.enableMock
const { location, history } = window
//#endregion 初始化配置

const defaultPageKey = PageKeys.EXPLORE

function isObjectInList(object, list) {
  return list.indexOf(object) !== -1
}

//#region AppContext 和初始化
const AppContext = React.createContext();
const defaultContext = {
  title: null,
  user: null,
  compactedLayout: false,
  collapseSider: true,
  browsingBookId: null,
}
const splitedPath = location.pathname.split('/');
const keyInUrl = splitedPath[1]
const possibleBookId = splitedPath[2]
defaultContext.pageKey = (keyInUrl in PageMap) ? keyInUrl : defaultPageKey
if (defaultContext.pageKey === PageKeys.BOOK && possibleBookId)
  defaultContext.browsingBookId = possibleBookId
//#endregion AppContext 和初始化

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
  },
  Sider: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0
  },
  UserButton: {
    margin: '0 1rem'
  }
})

//#region 事件处理器和 reducer

class ConfigLoadedEvent { constructor(data) { this.data = data } }

function changeStateByPageSegueEvent(state, event) {
  switch (event.targetPageKey) {
    case PageKeys.EXPLORE:
      document.title = `${state.title}`
      break;
    case PageKeys.CATEGORY:
      document.title = `${state.title} - 分类`
      break;
    case PageKeys.BOOK:
      const { bookId, bookName } = event.data
      state.browsingBookId = bookId
      document.title = `《${bookName}》介绍`
      break;
    default:
      throw new Error('跳转到程序无法解析的页面')
  }
  state.pageKey = event.targetPageKey
}

const handlerMapper = {
  [ConfigLoadedEvent]: (state, { data: { name } }) => {
    document.title = state.title = name
  },
  [Event.GoBackEvent]: (state, event) => {
    const { state: oldEvent } = history
    if (oldEvent)
      changeStateByPageSegueEvent(oldEvent, event)
    else
      state.pageKey = defaultPageKey
  },
  [Event.AdminLoginEvent]: (state, event) => {
    state.user = {
      username: event.username
    }
  },
  [Event.AdminLogoutEvent]: (state, event) => {
    state.user = null
  },
  [Event.SiderCollapseEvent]: (state, event) => {
    state.collapseSider = event.collapse
  },
  [Event.PageSegueEvent]: (state, event) => {
    const currentPageKey = state.pageKey
    const { targetPageKey } = event

    //#region 历史记录更新
    if (targetPageKey === PageKeys.BOOK) {
      const { bookId } = event.data
      history.pushState(event, null, `/${targetPageKey}/${bookId}`)
    } else {
      if (currentPageKey !== targetPageKey) {
        if (
          isObjectInList(targetPageKey, navPageList) &&
          isObjectInList(currentPageKey, navPageList)
        )
          history.replaceState(event, null, `/${targetPageKey}`)
        else
          history.pushState(event, null, `/${targetPageKey}`)
      } // else do nothing
    }
    //#endregion 历史记录更新

    changeStateByPageSegueEvent(state, event)
  }
}

function eventReducer(oldState, event) {
  const listener = handlerMapper[event.constructor]
  const newState = { ...oldState }
  listener(newState, event)
  return newState
}
//#endregion 事件处理器和 reducer

//#region 引用的组件
const navPageList = [PageKeys.EXPLORE]
if (Config.enableCategoryModule) navPageList.push(PageKeys.CATEGORY)
function NavMenu({ inSider = false }) {
  const { pageKey, dispatch } = useContext(AppContext)

  return <Menu
    style={{ lineHeight: '64px' }}
    theme="dark"
    mode="horizontal"
    selectedKeys={[`${pageKey}`]}
    onClick={({ key }) => {
      dispatch(new Event.PageSegueEvent({
        target: key
      }))
    }}
    {...inSider && { mode: 'inline' }}
  >
    {
      navPageList.map(key =>
        <Menu.Item key={key}>
          {PageMap[key].name}
        </Menu.Item>)
    }
  </Menu>
}

function Header({ onShowSider }) {
  const { title, user, compactedLayout, dispatch } = useContext(AppContext)
  const [searchValue, setSearchValue] = useState('')
  const styles = useAppStyles()
  const hasLogin = Boolean(user)

  return <Layout.Header className={styles.Header}>
    {title ?
      <Typography.Title level={1} style={{ flexGrow: 1 }} onClick={() => {
        dispatch(new Event.PageSegueEvent({
          target: PageKeys.EXPLORE
        }))
      }} children={title} />
      : <div style={{ flexGrow: 1 }} />
    }
    {compactedLayout
      ? null
      : <Input.Search
        placeholder="图书搜索"
        style={{ width: '25vw', marginRight: '1rem' }}
        value={searchValue}
        onChange={({ target: { value } }) => { setSearchValue(value) }}
        onSearch={value => { dispatch(new Event.SearchEvent(value)) }}
        enterButton />}
    {!compactedLayout && <NavMenu />}
    {
      hasLogin
        ? compactedLayout
          ? <Button className={styles.UserButton} shape="circle" icon="user" />
          : <Button className={styles.UserButton} shape="round" icon="user">我</Button>
        : compactedLayout
          ? <Button className={styles.UserButton} ghost shape="circle" icon="login" />
          : <Button className={styles.UserButton} ghost shape="round" icon="login">管理员</Button>
    }
    {
      compactedLayout
      && <Button
        className={styles.CollapseButton}
        icon="menu-unfold"
        ghost
        type="link"
        onClick={onShowSider}
      />
    }
  </Layout.Header>
}

function Sider({ collapsed, breakpointListener, onCollapse }) {
  const { Sider: style } = useAppStyles()

  return <Layout.Sider
    className={style}
    breakpoint="sm"
    collapsed={collapsed}
    collapsedWidth={0}
    width="66vw"
    onBreakpoint={breakpointListener}
  >
    <Button icon="right" style={{ width: '100%', height: '64px' }} type="link" ghost onClick={onCollapse} />
    <NavMenu inSider />
  </Layout.Sider>
}

function ContentContainer({ currentPageKey, footer }) {
  return <div style={{
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <Layout.Content style={{ padding: '1rem 3rem', flexGrow: 1, minHeight: 'auto' }}>
      {Array.from(Object.keys(PageMap)).map(key => {
        const PageComponent = PageMap[key].component
        const looking = key === currentPageKey
        return (<div key={key} {...!looking && { style: { display: 'none' } }}>
          <PageComponent isBackground={!looking} />
        </div>)
      })}
    </Layout.Content>
    {footer}
  </div>
}
//#endregion 引用的组件

function App() {
  const [state, dispatch] = useReducer(eventReducer, defaultContext)
  const [compactedLayout, setCompactedLayout] = useState(false)

  //#region 加载配置文件
  useAsync(async () => {
    const response = await fetch('/config.json')
    dispatch(new ConfigLoadedEvent(
      await response.json()
    ))
  }, [])
  //#endregion 加载配置文件

  const styles = useAppStyles()
  const { pageKey, collapseSider } = state

  useEffect(() => {
    window.addEventListener('popstate', () => {
      dispatch(new Event.GoBackEvent())
    })
  }, [])

  return <AntdConfigProvider locale={zhCN}>
    <AppContext.Provider value={{ ...state, compactedLayout, dispatch }}>
      <Layout className={styles.RootLayout}>
        <Layout onClick={() => { if (!collapseSider) dispatch(new Event.SiderCollapseEvent(true)) }}>
          <Header
            collapsed={collapseSider}
            onShowSider={() => { dispatch(new Event.SiderCollapseEvent(false)) }} />
          <ContentContainer
            currentPageKey={pageKey}
            footer={<Layout.Footer>
              某某大学版权所有
            </Layout.Footer>} />
        </Layout>
        <Sider
          collapsed={collapseSider}
          breakpointListener={broken => {
            if (!broken)
              dispatch(new Event.SiderCollapseEvent(true))
            setCompactedLayout(broken)
          }}
          onCollapse={() => { dispatch(new Event.SiderCollapseEvent(true)) }}
        />
      </Layout>
      {Config.showDebugger && <Debugger />}
    </AppContext.Provider>
  </AntdConfigProvider >
}

App.Context = AppContext
export default App;