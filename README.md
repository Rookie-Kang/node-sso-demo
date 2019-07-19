# node端单点登录demo

> 单点登录：指在多个应用系统中，用户只需要登陆一次，就能访问所有互相信任的应用系统

## 原理流程

![主流程](./images/sso.jpg)

## 中心管理系统(CAS)

单点登录核心部分，主要有登陆、校验jwt/session以及注销功能。

本demo里面使用redis，如果没有则需要在电脑上安装redis

启动CAS服务：

```text
> $ cd sso-cas/
> $ npm install
> $ npm start
```

原理：

+ CAS系统拥有一个登陆模块，所有的应用系统的 登陆/注销 功能全部由它管理
+ 通过session和cookies进行管理和校验，对外(应用系统)则分发jwt(或者token)，具体参看流程图
+ session的信息存在redis里面，而session本身不设置过期时间，而是通过设置redis信息的过期时间达到session过期的目的
+ 业务系统和CAS系统的关联就是jwt(或者token)，因为jwt里面含有sessionid，CAS系统可以通过sessionid在redis里面取到对应的数据。
+ 不同的应用系统有不同的jwt(或者token)

使用jwt原因：

+ jwt不易被修改，在jwt里面也不放重要的信息
+ jwt可以设置过期时间，jwt过期时间可以远远小于session的过期时间。
+ 通过配置jwt的校验机制，可以保证这个jwt只用于对应的应用系统。防止jwt丢失后，入侵其他信任的应用系统。

使用redis原因：

+ 简单上手，通过key-value就可完成业务需求
+ 性能高，不用每次访问都是连接数据库
+ 可以存在内存或者磁盘上面

## 应用系统

用于验证单点登录，也是CAS的服务对象。通过请求与CAS系统的约定后的API，来实现登录、验证/获取用户信息、注销的需求。

流程图中的验证URl，主要是用来将jwt设置到应用系统的cookies里面，使得之后访问应用系统时都能在cookie里面拿到jwt

启动：

```text
> $ cd sso-test1
> $ npm install
> $ npm start
```
