import socket 
from tkinter import *
def get_host():
  host = input_host.get()
  print_thing = socket.gethostbyname(host)
  print (print_thing)
win = Tk()
win.minsize(width=300, height=200)
win.title("get sever ip")
input_host = Entry(win)
button_submit = Button(win, text="submit", command=get_host)
input_host.pack()
button_submit.pack()
win.mainloop()
