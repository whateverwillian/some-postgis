import { 
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  username: string;

  @Column()
  location: string;
}

export default User;