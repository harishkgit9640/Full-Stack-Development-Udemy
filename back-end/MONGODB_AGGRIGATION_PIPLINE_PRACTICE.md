#Find all users who are older than 25 and younger than 30.


[
  {
    $match: {
			age : {$gte : 25, $lt: 30},      
    }
  },
  {
    $count: 'adultUser'
  }
]


#Retrieve all books published in 2021.

[
  {
    $match: {
      registered : {$gt :  new ISODate( "2015-01-01" ) , $lt :  new ISODate( "2019-01-01" )}
    }
  },
  {
    $group: {
      _id: "$registered",
    }
  },
  {
    $sort: {
      registered: -1
    }
  }

]




#List all authors whose name starts with "A".