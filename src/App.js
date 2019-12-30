import React, { useEffect, useState } from 'react';
import { useAsync, useDebounce, createBreakpoint } from 'react-use'
import './App.css';
import { ConfigProvider as AntdConfigProvider, Layout, Typography, Menu, Button, Input, Drawer, Spin, Affix } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'antd/dist/antd.css';
import { makeStyles } from '@material-ui/styles';
import { useMockableJsonFetch, useAppContext } from './hook'
import { PageKeys, PageMap } from './page'
import Debugger from './Debugger'
import * as Config from './Config'
import AppContext, { useAppState, navPageList } from './AppContext';
import { PageSegueEvent, GoBackEvent, ConfigLoadedEvent, ResponsiveEvent, ShowDrawerEvent } from './event'

//#region 初始化配置
moment.locale('zh-cn');
useMockableJsonFetch.enableMock = Config.enableMock
//#endregion 初始化配置

const searchDebounceTime = 300

const useAppStyles = makeStyles({
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
  },
  SpinWrapper: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
    /* width: '100vw',
     height: '100vh' */ }
})

//#region 引用的组件
export const defaultPageKey = PageKeys.EXPLORE
function NavMenu({ inDrawer = false }) {
  const { pageKey, dispatch } = useAppContext()

  return <Menu
    style={{ lineHeight: '64px' }}
    selectedKeys={[`${pageKey}`]}
    onClick={({ key }) => {
      dispatch(new PageSegueEvent({
        target: key
      }))
    }}
    {...{ mode: inDrawer ? 'inline' : 'horizontal' }}
    {...!inDrawer && { theme: "dark" }}
  >
    {
      navPageList.map(key =>
        <Menu.Item key={key}>
          {PageMap[key].name}
        </Menu.Item>)
    }
  </Menu>
}

function Header() {
  const { title, user, compactedLayout, showDrawer, dispatch } = useAppContext()
  const [searchInputedValue, setSearchInputedValue] = useState('')
  const styles = useAppStyles()
  const hasLogin = Boolean(user)

  useDebounce(
    () => {
      if (searchInputedValue)
        dispatch(new PageSegueEvent({
          target: PageKeys.SEARCH,
          data: { value: searchInputedValue }
        }))
    },
    searchDebounceTime,
    [searchInputedValue]
  );

  const onMyself = () => {
    dispatch(new PageSegueEvent({
      target: PageKeys.MYSELF
    }))
  }

  const onLogin = () => {
    dispatch(new PageSegueEvent({
      target: PageKeys.LOGIN
    }))
  }

  return <Layout.Header className={styles.Header}>
    {title ?
      <Typography.Title
        level={1}
        style={{
          flexGrow: 1,
          cursor: 'pointer'
        }}
        onClick={() => {
          dispatch(new PageSegueEvent({
            target: PageKeys.EXPLORE
          }))
        }} children={title} />
      : <div style={{ flexGrow: 1 }} />
    }
    {compactedLayout
      ? <Button icon="search" ghost shape="circle" onClick={() => {
        dispatch(new PageSegueEvent({
          target: PageKeys.SEARCH,
          data: { value: '' }
        }))
      }} />
      : <Input.Search
        placeholder="图书搜索"
        style={{ width: '25vw', marginRight: '1rem' }}
        value={searchInputedValue}
        onChange={({ target: { value } }) => { setSearchInputedValue(value) }}
        onSearch={value => {
          setSearchInputedValue('')
          dispatch(new PageSegueEvent({
            target: PageKeys.SEARCH,
            data: { value: searchInputedValue }
          }))
        }}
        enterButton />}
    {!compactedLayout && <NavMenu />}
    {
      hasLogin
        ? compactedLayout
          ? <Button className={styles.UserButton} ghost shape="circle" icon="user" onClick={onMyself} />
          : <Button className={styles.UserButton} shape="round" icon="user" onClick={onMyself}>我</Button>
        : compactedLayout
          ? <Button className={styles.UserButton} ghost shape="circle" icon="login" onClick={onLogin} />
          : <Button className={styles.UserButton} ghost shape="round" icon="login" onClick={onLogin}>管理员</Button>
    }
    {
      compactedLayout
      && <Button
        className={styles.CollapseButton}
        icon="menu-unfold"
        ghost
        type="link"
        onClick={() => { dispatch(new ShowDrawerEvent(true)) }}
      />
    }
    <Drawer
      title="导航"
      visible={showDrawer}
      bodyStyle={{ padding: 0 }}
      onClose={() => { dispatch(new ShowDrawerEvent(false)) }}>
      <NavMenu inDrawer />
    </Drawer>
  </Layout.Header>
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
          <PageComponent loseFocus={!looking} />
        </div>)
      })}
    </Layout.Content>
    {footer}
  </div>
}

function GlobalSpin({ show }) {
  const styles = useAppStyles()

  return <Affix style={{
    position: 'fixed',
    zIndex: show ? 1 : -1,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden'
  }}>
    <Spin spinning={show} size="large" >
      <div style={{ width: '100vw', height: '100vh' }} />
    </Spin>
  </Affix>
}

//#endregion 引用的组件

const useBreakpoint = createBreakpoint({
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
})

function App() {
  const appState = useAppState()
  const breakpoint = useBreakpoint()

  useEffect(() => {
    dispatch(new ResponsiveEvent({
      compacted: breakpoint === 'xs' || breakpoint === 'sm'
    }))
  }, [breakpoint])

  const { dispatch, pageKey, globalWaiting, } = appState

  //#region 加载配置文件
  useAsync(async () => {
    const response = await fetch('/config.json')
    dispatch(new ConfigLoadedEvent(
      await response.json()
    ))
  }, [])
  //#endregion 加载配置文件

  useEffect(() => {
    window.addEventListener('popstate', () => {
      dispatch(new GoBackEvent())
    })
  }, [dispatch])

  return <AntdConfigProvider locale={zhCN}>
    <AppContext.Provider value={appState}>
      <Layout style={{ height: '100%', display: 'flex' }}>
        <Affix>
          <Header />
        </Affix>
        <ContentContainer
          currentPageKey={pageKey}
          footer={<Layout.Footer>
            某某大学版权所有
            </Layout.Footer>} />
        <GlobalSpin show={globalWaiting} />
      </Layout>
      {Config.showDebugger && <Debugger />}
    </AppContext.Provider>
  </AntdConfigProvider >
}

export default App;