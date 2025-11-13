-- Create Database
CREATE DATABASE MusicStore;
GO

USE MusicStore;
GO

-- Table: Formats
CREATE TABLE Formats (
    FormatID INT IDENTITY(1,1) PRIMARY KEY,
    FormatName NVARCHAR(50) NOT NULL
);
GO

-- break

INSERT INTO Formats (FormatName)
VALUES ('Vinyl'), ('CD'), ('Cassette');
GO

-- Table: Products
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100) NOT NULL,
    Artist NVARCHAR(100) NOT NULL,
    ReleaseDate DATE,
    Genre NVARCHAR(50),
    Label NVARCHAR(50),
    Price DECIMAL(10, 2) NOT NULL
);
GO

-- Table: Inventory
CREATE TABLE Inventory (
    InventoryID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    FormatID INT NOT NULL,
    Quantity INT DEFAULT 0,
    SKU NVARCHAR(50) UNIQUE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (FormatID) REFERENCES Formats(FormatID)
);
GO



-- filler data 
INSERT INTO Products (Title, Artist, ReleaseDate, Genre, Label, Price)
VALUES 
('The Dark Side of the Moon', 'Pink Floyd', '1973-03-01', 'Rock', 'Harvest', 29.99),
('Thriller', 'Michael Jackson', '1982-11-30', 'Pop', 'Epic', 19.99),
('Nevermind', 'Nirvana', '1991-09-24', 'Grunge', 'DGC', 24.99);

INSERT INTO Inventory (ProductID, FormatID, Quantity, SKU)
VALUES
(1, 1, 15, 'VINYL-001'),
(1, 2, 10, 'CD-001'),
(2, 2, 25, 'CD-002'),
(3, 3, 5, 'CAS-001');


-- test for data insertion
SELECT TOP 3* FROM Products;

select * from inventory

