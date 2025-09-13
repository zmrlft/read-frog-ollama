现在的 config migration 的 test 
  有一个问题，就是每个版本只能有一个测试，然后一只延续。这样的话，最起先的那个第一个版本的 
  config 相对简单，migrate 到后面，比如有一些新增的字段，但是 migrate 之后是 empty 
  list，undefined 什么的，那就之后的 migrate test 不能丰富测试这些字段是别的值的可能性。\
  \
  现在我想重新设计 test，每个在 @apps/extension/src/utils/config/__tests__/example/  
  的测试文件中，有一个map，map 的 key 是这个 test 所在的系列，map 的 value 是 { description: 
  "xxxx", config: "xxxxxx" } 然后会 migrate 测试会根据系列的 key，匹配下一个版本要跑的 
  migration，一个系列可能会在某个版本出现第一个 example，比如在 6 
  版本，也可能在一个版本消失，比如在 10 版本，如果是这样，就要测试 6-7-8-9-10 的 4 次 migration
   都正确。\
  \
  请你帮我弄一下这个数据结构，保证目前的 example 都能在新的数据结构下运行，然后在帮我写一些新的
   test example，然后最终确保所有通过测试