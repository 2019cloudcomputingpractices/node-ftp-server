#!/bin/bash
starttime=`date +'%Y-%m-%d %H:%M:%S'`
#执行程序
method=$1
filename=$2
concurrency=$3
# set ipaddr [lindex $argv 0]
# set filename [lindex $argv 2]
# filename="1.pdf"
# concurrency=1;
# let newname="n.pdf"    
# let a=1;               
for ((a=1; a <= $concurrency; a++))
do    
    ./ftp_test.sh $method $filename "$a.tmp"&
done
wait
endtime=`date +'%Y-%m-%d %H:%M:%S'`
start_seconds=$(date --date="$starttime" +%s);
end_seconds=$(date --date="$endtime" +%s);
let total_time=end_seconds-start_seconds;
let total=0;
for ((a=1; a <= $concurrency; a++))
do
	if [ $method = "get" ]
	then
    sz=$(wc -c < "$a.tmp");
	else
		sz=$(wc -c < "$filename");
	fi
	let total=total+sz;
done
echo "并发数: $concurrency"
echo "本次运行时间: $total_time s"
echo "服务器 $method 吞吐量: "$(bc <<< "scale=2; $concurrency/$total_time")" outputs/s"
echo "服务器 $method 总传输带宽: "$((total/total_time))" bytes/s"