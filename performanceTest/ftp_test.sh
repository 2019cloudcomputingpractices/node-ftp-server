#!/usr/bin/expect
set timeout -1
set method [lindex $argv 0]
set filename [lindex $argv 1]
set newname [lindex $argv 2]
set ipaddr "172.18.231.71"
#set ipaddr "127.0.0.1"
set username "hjj"
set password "123"


spawn ftp $ipaddr
#expect "{(Name)*:}"
expect "Name*:"
send "$username\n"
#expect "{(Password)*:}"
expect "Password*:"
send "$password\n"
expect "ftp>"
send "type binary\n"
expect "ftp>"
send "$method $filename $newname\n"
expect "ftp>"
send "quit\n"
expect "221*"
#interact
exit