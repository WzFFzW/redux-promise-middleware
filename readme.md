使用方法
```
// 使用前先将redux_middleware加入到redux的中间件中
import { middleware, self_dispatch } from 'src/middle_redux';
interface User {
  name:string;
}
middleware.add_model({
  namespace: 'test',
  effects: {
    'user': async ({dispatch}, action) => {
      console.log(action);
      const res = await fetch();
      if (res.status === 200) {
        console.log('success');
        const res2 = await dispatch({type: 'test/course'});
        console.log('res2', res2);
      }
      return res;
    },
    'course': async () => {
      const res = await fetch();
      console.log(1);
      console.log('res', res);
      return 'end';
    },
  },
});

class Component extends React.Component {
  componentWillMount () {
    self_dispatch<User>('test/user').then((res) => {
      console.log(res);
    });
  }
}
```

下一步计划，增加cancel的方法，取消这个action.