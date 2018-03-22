#!/bin/sh

#usage:
#   To run all tests: ./run.sh
#   To run some tests: ./run.sh testDS (prefix what you want)
#   To run a test: ./run testDS01 (prefix what you want)

evaluatedTests=0
failedTests=0

 if  [ -n "$1" ]
  then
    if [ "$1" = "-f" ]
     then
        list=`cat lastFails.txt`
     else
        list=`ls $1*`
    fi    
  else
	list=`ls test*.js`
  fi

rm results.txt
rm lastFails.txt

for fileName in $list
do
  echo "// Test: $fileName (cat $fileName | node '../launcher.js' | node)"
  cat $fileName | node '../launcher.js' | node > temp.txt 2>&1
  temp=`cat temp.txt`

  evaluatedTests=`expr $evaluatedTests + 1`
  if  [ -n "$temp" ]
  then
    failedTests=`expr $failedTests + 1`
    echo "// ---------------------------------" >> results.txt
    echo "// $fileName" >> results.txt
    echo "// ---------------------------------" >> results.txt
    echo $fileName >> lastFails.txt
    cat temp.txt >> results.txt
  fi  
 done

if [ $failedTests -gt 0 ]
then
  echo "" >> results.txt
  echo "// Failed $failedTests of $evaluatedTests tests." >> results.txt
fi    

 rm temp.txt
 cat results.txt
