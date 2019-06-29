# node-ftp-server

## socket.session
- username <string>
- isLogged <bool>
- basePath <string>: 该用户根目录的本地路径
- path <string>: 相对于该用户根目录的路径，eg：
    - "/"
    - "/fold1"
    - "/fold1/fold11"

## 性能测试

`Linux`环境下，需要提前安装[`expect`](https://linux.die.net/man/1/expect )

```bash
cd performanceTest
修改ftp_test.sh文件中的ipaddr、username、password
./test.sh {get | put} filename concurrNum
```

