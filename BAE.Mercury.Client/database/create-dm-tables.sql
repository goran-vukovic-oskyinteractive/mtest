use DB_52806_mercury
if exists(select name from sysobjects where name = 'NodeInsert' and type = 'tr')
   drop trigger NodeInsert
go

if exists(select name from sysobjects where name = 'NodeUpdate' and type = 'tr')
   drop trigger NodeUpdate
go

if exists(select name from sysobjects where type = 'u' and name = 'DMTree')
	Drop table DMTree
go

if exists(select name from sysobjects where type = 'u' and name = 'DMNode')
	Drop table DMNode
go

create table DMNode(
	NodeId int not null identity,
	ParentId int null,
	NodeName varchar(255) not null,
	constraint PK_Node primary key(NodeId)
	--constraint UK_NodeName unique(NodeName)
)
go

create table DMTree(
	NodeId int not null,
	ParentId int not null,
	Level int not null,
	constraint PK_Tree primary key(NodeId, ParentId),
	constraint UK_Level unique(NodeId, Level)
)
go

alter table DMNode
	add constraint FK_NodeNode foreign key(ParentId) references DMNode(NodeId) --on delete cascade
go

alter table DMTree
	add constraint FK_NodeTreeNode foreign key(NodeId) references DMNode(NodeId) on delete cascade
go

--alter table DMTree
--	add constraint FK_NodeTreeParent foreign key(ParentId) references DMNode(NodeId) on delete cascade
--go


create trigger NodeInsert on DMNode for insert as
begin
	set nocount on

	insert into DMTree(NodeId, ParentId, Level)
	select NodeId, NodeId, 0
	from inserted


	insert into DMTree(NodeId, ParentId, Level)
	select n.NodeId, t.ParentId, t.Level + 1
	from inserted n, DMTree t
	where n.ParentId = t.NodeId

end

go

create trigger NodeUpdate on DMNode for update as
if update(ParentId)
begin
	set nocount on

	declare @child table(NodeId int, Level int)

	insert into @child(NodeId, Level)
	select t.NodeId, t.Level
	from inserted n, DMTree t
	where n.NodeId = t.ParentId and t.Level > 0

	delete DMTree
	where
		DMTree.NodeId in(select NodeId from @child)
		and DMTree.ParentId in(
			select t.ParentId
			from inserted n, DMTree t
			where n.NodeId = t.NodeId and t.Level > 0
		)

	delete DMTree
	where DMTree.NodeId in(select NodeId from inserted) and DMTree.Level > 0

	insert into DMTree(NodeId, ParentId, Level)
	select n.NodeId, t.ParentId, t.Level + 1
	from inserted n, DMTree t
	where n.ParentId = t.NodeId

	insert into DMTree(NodeId, ParentId, Level)
	select c.NodeId, t.ParentId, t.Level + c.Level
	from inserted n, DMTree t, @child c
	where n.NodeId = t.NodeId and t.Level > 0
end
go

SET IDENTITY_INSERT DMNode ON
insert into DMNode(NodeId, ParentId, NodeName) values(0, null, 'Root')
insert into DMNode(NodeId, ParentId, NodeName) values(1, 0, 'Set 1')
insert into DMNode(NodeId, ParentId, NodeName) values(2, 1, 'Unit = 1 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(3, 1, 'Unit = 2 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(4, 0, 'Set 2')
insert into DMNode(NodeId, ParentId, NodeName) values(5, 1, 'Unit = 1 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(6, 1, 'Unit = 2 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(7, 1, 'Root')
/*
insert into DMNode(NodeId, ParentId, NodeName) values(0, null, 'Root')
insert into DMNode(NodeId, ParentId, NodeName) values(1, null, 'Unit = 2 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(2, 1, 'SIC = SAA')
insert into DMNode(NodeId, ParentId, NodeName) values(3, 2, 'App1\1 RAR')

insert into DMNode(NodeId, ParentId, NodeName) values(4, 2, 'App5\1 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(5, 1, 'SIC = SAB')
insert into DMNode(NodeId, ParentId, NodeName) values(6, 1, 'App6\1 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(7, 6, 'App6\2 RAR')

insert into DMNode(NodeId, ParentId, NodeName) values(8, 6, 'App6\3 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(9, 5, 'App6\4 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(10, 5, 'App6\5 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(11, 5, 'App6\6 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(12, 5, 'App6\7 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(13, 5, 'App6\8 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(14, 5, 'App6\9 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(15, 5, 'App6\10 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(16, 5, 'App6\11 RAR')
insert into DMNode(NodeId, ParentId, NodeName) values(17, 5, 'App6\12 RAR')
*/
/*
declare @i int
set @i = 1
while @i < 300
	begin
		--insert into DMNode(NodeId, ParentId, NodeName) values(17 + @i, 5, 'App6\' + cast(12 + @i as varchar(10)) + 'RAR0123456789012345678901234567890123456789012345678901234567890123456789')
		insert into DMNode(NodeId, ParentId, NodeName) values(17 + @i, 5, 'App6\' + cast(12 + @i as varchar(10)) + 'RAR')
		print @i
		set @i = @i + 1
	end
--insert into DMNode(NodeId, ParentId, NodeName) values(18, 5, 'App6\1 RAR')
--insert into DMNode(NodeId, ParentId, NodeName) values(19, 5, 'App6\1 RAR')
*/


SET IDENTITY_INSERT DMNode OFF

select * from DMNode
select * from DMTree


--gets all descendants of the DMNode 2
select c.*
from DMNode n, DMTree t, DMNode c
where n.NodeId=2
	and n.NodeId = t.ParentId
	and t.NodeId = c.NodeId

/*
--gets path to the root from DMNode 7
select p.*
from DMNode n, DMTree t, DMNode p
where n.NodeId=7
	and n.NodeId = t.NodeId
	and t.ParentId = p.NodeId

--changes parent of DMNode 4 from 2 to 1
update DMNode set ParentId = 1 where NodeId = 4
select * from DMNode
select * from DMTree
*/