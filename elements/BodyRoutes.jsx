'use strict';
var _ = require('lodash');
var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Body = require('theme/Body');
var Post = require('theme/Post');
var MarkdownPage = require('theme/MarkdownPage');
var Blog = require('theme/Blog');

var BodyContent = require('./BodyContent.jsx')(Body);

var config = require('config');
var paths = require('../paths');

var blogRoot = config.blogRoot || 'blog';


var AsyncElement = {
  loadedComponent: null,

  load: function () {
    if (this.constructor.loadedComponent)
      return;

    this.bundle(function (component) {
      this.constructor.loadedComponent = component;
      this.forceUpdate();
    }.bind(this));
  },

  componentDidMount: function () {
    setTimeout(this.load, 1000); // feel it good
  },

  render: function () {
    var Component = this.constructor.loadedComponent;
    if (Component) {
      // can't find RouteHandler in the loaded component, so we just grab
      // it here first.
      this.props.activeRoute = <RouteHandler/>;
      return <Component {...this.props}/>;
    }
    return this.preRender();
  }
};

var pageRoutes = _.map(paths.allPages(), function(page, key) {
  var handler;

  // XXXXX: why / yields just Loading... ? why not others?
  if(page.fileName) {
    handler = React.createClass({
      mixins: [AsyncElement],
      bundle: require('bundle?lazy!pages/' + page.fileName),
      preRender: function () {
        return <div>Loading...</div>;
      }
    });
  }
  else if(isMarkdownFile(page)) {
    handler = MarkdownPage;
  }
  else {
    handler = require('pages/' + page.fileName);
  }

  var path = '/';
  if(page.url !== '/') {
    path = '/' + page.url + '/?';
  }

  return <Route path={path} key={page.url} name={page.url} handler={handler}></Route>
});

function isMarkdownFile(page) {
  return page.fileName && page.fileName.indexOf('.md') > -1
}

var Routes = (
  <Route name='bodyContent' handler={BodyContent}>
    <Route name={'/' + blogRoot} path={'/' + blogRoot + '/?'} handler={Blog}></Route>
    <Route name='post' path={'/' + blogRoot + '/:post'} handler={Post}></Route>
    <Route name='postWithNesting' path={'/' + blogRoot + '/*/:post'} handler={Post}></Route>
    {pageRoutes}
  </Route>
);


module.exports = Routes
