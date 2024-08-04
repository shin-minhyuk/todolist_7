import { useEffect, useRef, useState } from "react";
import "./App.css";
const URL = "https://korean-advice-open-api.vercel.app/api/advice";

function App() {
  // todo = [{id: Number(new Date()), content:'안녕하세요'}, {}, {} ...]
  const [isLoading, data] = useFetch("http://localhost:3000/todo");
  const [todos, setTodos] = useState([]);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [time, setTime] = useState(0);
  const [isTimer, setIsTimer] = useState(true);

  useEffect(() => {
    if (currentTodo) {
      fetch(`http://localhost:3000/todo/${currentTodo}`, {
        method: "PATCH",
        body: JSON.stringify({
          time: todos.find((el) => el.id === currentTodo).time + 1,
        }),
      })
        .then((res) => res.json())
        .then((res) =>
          setTodos((todoArr) =>
            todoArr.map((todo) => (todo.id === currentTodo ? res : todo))
          )
        );
    }
  }, [time]);

  useEffect(() => {
    setTime(0);
  }, [isTimer]);

  useEffect(() => {
    if (data) {
      setTodos(data);
    }
  }, [isLoading]);

  return (
    <>
      <h1>TODO LIST</h1>
      <Clock />
      <Advice />
      <button
        onClick={() => {
          setIsTimer((prev) => !prev);
        }}
      >
        {isTimer ? "타이머로 변경" : "스톱워치로 변경"}
      </button>
      {isTimer ? (
        <StopWatch time={time} setTime={setTime} />
      ) : (
        <Timer time={time} setTime={setTime} />
      )}
      <TodoInput setTodos={setTodos} />
      <TodoList
        todos={todos}
        setTodos={setTodos}
        setCurrentTodo={setCurrentTodo}
        currentTodo={currentTodo}
      />
    </>
  );
}

const useFetch = (url) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      });
  }, [url]);
  return [isLoading, data];
};

// 명언 api 호출
const Advice = () => {
  const [isLoading, data] = useFetch(URL);
  return (
    <>
      {!isLoading && (
        <>
          <div className="advice">{data.message}</div>
          <div className="advice">- {data.author} -</div>
        </>
      )}
    </>
  );
};

const Clock = () => {
  const [time, setTime] = useState(new Date());

  // 부정확한 간격:
  // 상태 업데이트와 리렌더링 시간 때문에
  // 타이머 간격이 정확하지 않을 수 있습니다.

  // useEffect(() => {
  //   setTimeout(() => {
  //     setTime(new Date());
  //     console.log("작동중");
  //   }, 1000);
  // }, [time]);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <div className="clock">{time.toLocaleTimeString()}</div>;
};

const formatTime = (seconds) => {
  const timeString = `${String(Math.floor(seconds / 3600)).padStart(
    2,
    "0"
  )}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(
    Math.floor(seconds % 60)
  ).padStart(2, "0")}`;

  return timeString;
};

const Timer = ({ time, setTime }) => {
  const [startTime, setStartTime] = useState(0);
  const [isOn, setIsOn] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isOn && time > 0) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    // 혹시모를 사라지는 상황 대비
    return () => {
      clearInterval(timerRef.current);
    };
  }, [isOn, time]);

  return (
    <div>
      <div>
        {/* 0 = falsy, 0이 아닌 숫자 = truthy */}
        {time ? formatTime(time) : formatTime(startTime)}
        <button
          onClick={() => {
            setIsOn(true);
            setTime(time ? time : startTime);
            setStartTime(0);
          }}
        >
          시작
        </button>
        <button
          onClick={() => {
            setIsOn(false);
          }}
        >
          정지
        </button>
        <button
          onClick={() => {
            setIsOn(false);
            setTime(0);
          }}
        >
          리셋
        </button>
      </div>
      <input
        type="range"
        max={3600}
        step={10}
        min={0}
        value={startTime}
        onChange={(event) => setStartTime(event.target.value)}
      />
    </div>
  );
};

const StopWatch = ({ time, setTime }) => {
  const [isOn, setIsOn] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOn === true) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
  }, [isOn]);

  return (
    <div>
      {formatTime(time)}
      <button onClick={() => setIsOn((prev) => !prev)}>
        {isOn ? "끄기" : "켜기"}
      </button>
      <button
        onClick={() => {
          setTime(0);
          setIsOn(false);
        }}
      >
        리셋
      </button>
    </div>
  );
};
const TodoInput = ({ setTodos }) => {
  const inputRef = useRef(null);

  const addTodo = () => {
    const newTodo = {
      // id: Number(new Date()).toString(),
      content: inputRef.current.value,
      time: 0,
    };

    fetch("http://localhost:3000/todo", {
      method: "POST",
      body: JSON.stringify(newTodo),
    })
      .then((res) => res.json())
      .then((res) => setTodos((prev) => [...prev, res]));
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={addTodo}>추가</button>
    </>
  );
};

const TodoList = ({ todos, setTodos, setCurrentTodo, currentTodo }) => {
  return (
    <ul>
      {todos.map((todo) => (
        <Todo
          key={todo.id}
          todo={todo}
          setTodos={setTodos}
          setCurrentTodo={setCurrentTodo}
          currentTodo={currentTodo}
        />
      ))}
    </ul>
  );
};

const Todo = ({ todo, setTodos, setCurrentTodo, currentTodo }) => {
  return (
    <li className={currentTodo === todo.id ? "current" : null}>
      <div>
        {todo.content}
        <br />
        {formatTime(todo.time)}
      </div>
      <div>
        <button onClick={() => setCurrentTodo(todo.id)}>시작</button>
        <button
          onClick={() => {
            fetch(`http://localhost:3000/todo/${todo.id}`, {
              method: "DELETE",
            }).then((res) => {
              if (res.ok) {
                setTodos((prev) => prev.filter((el) => el.id !== todo.id));
              }
            });
          }}
        >
          삭제
        </button>
      </div>
    </li>
  );
};

export default App;
